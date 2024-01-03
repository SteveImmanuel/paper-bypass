import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import playwright from 'playwright';

const sshTunnel = async (username, ip, privateKeyPath, port) => {
  const ssh = exec(`ssh -o BatchMode=yes -T -D ${port} ${username}@${ip} -i ${privateKeyPath}`);
  return ssh;
};

const ieeeDownload = async (link, downloadDir, port, timeoutDuration) => {
  let browser;
  timeoutDuration = parseInt(timeoutDuration, 10);

  try {
    console.log('Launching browser');
    browser = await playwright.firefox.launch({
      headless: true,
      proxy: {
        server: `socks5://localhost:${port}`,
      },
    });
  } catch (e) {
    console.error('Error launching browser');
    return ''
  }

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    console.log(`Navigating to ${link}`);
    await page.goto(link, { timeout: timeoutDuration });
  
    const title = await page.innerText('.document-title');
    console.log(`Document title: ${title}`);
    await page.click('.pdf-btn-container');
    console.log('Attempting to download PDF');
  
    const modalDialog = await page.$('.modal-dialog');
    if (modalDialog) {
      throw new Error('Cannot bypass using IP address');
    }
  
    const download = await page.waitForEvent('download', { timeout: timeoutDuration });
    const tempPath = await download.path();
  
    const outPath = path.join(downloadDir, `${title}.pdf`)
    fs.renameSync(tempPath, outPath)
  
    console.log(`File downloaded to ${outPath}`);
    await browser.close();
    return outPath;
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }

  return '';
};

const bypass = async (link, downloadDir, username, ip, privateKeyPath, port, timeoutDuration) => {
  console.log(`Establishing SSH tunnel on port ${port}`)
  const ssh = await sshTunnel(username, ip, privateKeyPath, port);
  ssh.stderr.on('data', (data) => {
    ssh.kill();
    process.exit(1);
  });
  process.on('exit', () => {
    console.log(`Closing SSH tunnel on port ${port}`)
    ssh.kill();
  });
  console.log('SSH tunnel established');

  const result = await ieeeDownload(link, downloadDir, port, timeoutDuration);
  if (result === '') {
    process.exit(1);
  }
  console.log(`FINALOUT ${result}`);
  process.exit(0);
}

const params = process.argv.slice(2);
bypass(...params);
// main('https://ieeexplore.ieee.org/abstract/document/9966270', '.', 'vli-admin', '100.77.80.36', './nas');
// main('https://ieeexplore.ieee.org/abstract/document/9747630', '.', 'vli-admin', '100.77.80.36', './nas');
