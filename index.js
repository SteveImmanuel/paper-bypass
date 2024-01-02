const playwright = require('playwright');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const constants = require('./constants');

const sshTunnel = async (username, ip, privateKeyPath) => {
  const ssh = exec(`ssh -o BatchMode=yes -T -D ${constants.SSH_TUNNEL_PORT} ${username}@${ip} -i ${privateKeyPath}`);
  return ssh;
};

const ieeeDownload = async (link, downloadDir) => {
  const browser = await playwright.firefox.launch({
    headless: false,
    proxy: {
      server: `socks5://localhost:${constants.SSH_TUNNEL_PORT}`,
    },
  });
  console.log('Launching browser');

  const context = await browser.newContext();
  const page = await context.newPage();
  console.log(`Navigating to ${link}`);
  await page.goto(link, { timeout: constants.TIMEOUT_DURATION });

  const title = await page.innerText('.document-title');
  console.log(`Document title: ${title}`);
  await page.click('.pdf-btn-container');
  console.log('Attempting to download PDF');

  const modalDialog = await page.$('.modal-dialog');
  if (modalDialog) {
    console.error('Cannot bypass using IP address');
    await browser.close();
    return ''
  }

  const download = await page.waitForEvent('download', { timeout: constants.TIMEOUT_DURATION });
  const tempPath = await download.path();

  const outPath = path.join(downloadDir, `${title}.pdf`)
  fs.renameSync(tempPath, outPath)

  console.log(`File downloaded to ${outPath}`);
  await browser.close();
  return outPath;
};

const main = async (link, downloadDir, username, ip, privateKeyPath) => {
  // console.log('Establishing SSH tunnel')
  // const ssh = await sshTunnel(username, ip, privateKeyPath);
  // ssh.stderr.on('data', (data) => {
  //   ssh.kill();
  //   process.exit(1);
  // });
  // process.on('exit', () => {
  //   // console.log('Closing SSH tunnel')
  //   ssh.kill();
  // });
  // console.log('SSH tunnel established');

  try {
    await ieeeDownload(link, downloadDir);
  } catch (e) {
    console.log('Error occurred')
  }
}

main('https://ieeexplore.ieee.org/abstract/document/9966270', '.', 'vli-admin', '100.77.80.36', './nas');
// main('https://ieeexplore.ieee.org/abstract/document/9747630', '.', 'vli-admin', '100.77.80.36', './nas');
