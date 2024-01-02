const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const configs = require('../configs');

const jobStatus = {
  PENDING: 0,
  IN_PROGRESS: 1,
  SUCCESS: 2,
  FAILED: 3,
};

class Database {
  constructor(dbPath = ':memory:') {
    this.db = new sqlite3.Database(dbPath);
    this.initialize();
  }

  async initialize() {
    try {

      await new Promise((resolve, reject) => {
        this.db.serialize(() => {
          this.db.exec(
            `CREATE TABLE IF NOT EXISTS users (
                username TEXT,
                password TEXT
              );
              CREATE TABLE IF NOT EXISTS jobs (
                job_id INTEGER PRIMARY KEY AUTOINCREMENT,
                link TEXT,
                status INTEGER, -- 0: pending, 1: in progress, 2: success, 3: failed
                path TEXT,
                created_at TEXT
              );
              `,
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
      });

      const row = await this.get('SELECT COUNT(*) as count FROM users')
      if (row.count === 0) {
        const hashedPassword = bcrypt.hashSync(configs.PASSWORD, 10);
        await this.run('INSERT INTO users (username, password) VALUES (?, ?)', [configs.USERNAME, hashedPassword]);
      }
    } catch (err) {
      throw err;
    }
  }

  async run(query, params) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  async get(query, params) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  async all(query, params) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  async getJobStatusById(jobId) {
    const row = await this.get('SELECT status FROM jobs WHERE job_id = ?', [jobId]);
    if (!row) {
      return null;
    }
    return row.status;
  }

  async createJob(link) {
    await this.run('INSERT INTO jobs (status, link, created_at) VALUES (?, ?, ?)', [0, link, new Date().toISOString()]);
  }

  async updateJobStatus(jobId, status, path = null) {
    if (status === jobStatus.SUCCESS) {
      await this.run('UPDATE jobs SET status = ?, path = ? WHERE job_id = ?', [status, path, jobId]);
    } else {
      await this.run('UPDATE jobs SET status = ? WHERE job_id = ?', [status, jobId]);
    }
  }

  async getJobPath(jobId) {
    const row = await this.get('SELECT path FROM jobs WHERE job_id = ?', [jobId]);
    if (!row) {
      return null;
    }
    return row.path;
  }

  async getTotalInProgressJobs() {
    const row = await this.get('SELECT COUNT(*) as count FROM jobs WHERE status = ?', [jobStatus.IN_PROGRESS]);
    return row.count;
  }

  async getAllJobs() {
    const rows = await this.all('SELECT * FROM jobs ORDER BY created_at ASC');
    return rows;
  }

  async getAllPendingJobs() {
    const rows = await this.all('SELECT * FROM jobs WHERE status = ? ORDER BY created_at ASC', [jobStatus.PENDING]);
    return rows;
  }
}

// (async () => {
//   const db = new Database('./db.sqlite3');
//   // await db.createJob('https://ieeexplore.ieee.org/document/9148848');
//   // await db.createJob('https://ieeexplore.ieee.org/document/914812');
//   // await db.createJob('https://ieeexplore.ieee.org/document/914848');
//   const rows = await db.getAllJobs();
//   console.log(rows);
// })();

module.exports = {
  Database,
  jobStatus,
};