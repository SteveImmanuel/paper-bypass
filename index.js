const { exec } = require('child_process');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Database, jobStatus } = require('./db');
const configs = require('./configs');
const dbInstance = new Database('./db/db.sqlite3');

const app = express();
app.use(express.json());

app.post('/auth', async (req, res) => {
  const { username, password } = req.body;

  const row = await dbInstance.get('SELECT password FROM users WHERE username = ?', [username]);
  if (!row || !bcrypt.compareSync(password, row.password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, configs.JWT_SECRET, { expiresIn: '365d' });
  res.json({ message: 'Success authentication', data: { token } });
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Token error' });
  }

  const [scheme, token] = parts;

  jwt.verify(token, configs.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalid' });
    }

    req.userId = decoded.id;
    return next();
  });
};

app.post('/bypass', authMiddleware, async (req, res) => {
  const { link } = req.body;
  if (!link) {
    return res.status(400).json({ message: 'Missing link' });
  }

  const sshTunnelPort = Math.floor(Math.random() * 3000) + 6000;
  const childProcess = exec(`node bypass.js ${link} ${configs.DOWNLOAD_DIR} ${configs.SSH_USERNAME} ${configs.SSH_IP} ${configs.SSH_KEY_PATH} ${sshTunnelPort}`);
  await dbInstance.createJob(childProcess.pid, 'https://ieeexplore.ieee.org/document/9146878');

  let finalLine = null;
  childProcess.stdout.on('data', (data) => {
    const tempLine = data.toString().trim().split('\n').pop();
    if (tempLine.startsWith('FINALOUT')) {
      finalLine = tempLine.substring(9); // Get rid of 'FINALOUT '
    } else {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Child process ${childProcess.pid}: ${tempLine}`);
    }
  });

  childProcess.on('exit', (code) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Child process ${childProcess.pid} exited with code ${code}`);
    if (code === 0) {
      dbInstance.updateJobStatus(childProcess.pid, jobStatus.SUCCESS, finalLine);
    } else {
      dbInstance.updateJobStatus(childProcess.pid, jobStatus.FAILED);
    }
  });
  res.json({ message: 'Success creating job', data: { pid: childProcess.pid } });
});

app.get('/jobs', authMiddleware, async (req, res) => {
  const jobs = await dbInstance.getAllJobs();
  res.json({ message: 'Success getting all jobs', data: jobs });
});

// app.get('/download/:id', authMiddleware, async (req, res) => {
app.get('/download/:id', async (req, res) => {
  const { id } = req.params;
  const job = await dbInstance.getJobById(id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  if (job.status === jobStatus.FAILED) {
    return res.status(400).json({ message: 'Job failed, cannot be downloaded' });
  } else if (job.status === jobStatus.IN_PROGRESS) {
    return res.status(400).json({ message: 'Job still in progress, cannot be downloaded' });
  } else if (job.status === jobStatus.PENDING) {
    return res.status(400).json({ message: 'Job still pending, cannot be downloaded' });
  } else if (job.status === jobStatus.SUCCESS) {
    return res.download(job.path);
  }
});

app.listen(configs.PORT, () => {
  console.log(`Listening on port ${configs.PORT}`);
});