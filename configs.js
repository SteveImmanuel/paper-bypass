if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

module.exports = {
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: parseInt(process.env.PORT, 10),
  TIMEOUT_DURATION: parseInt(process.env.TIMEOUT_DURATION, 10),
  SSH_USERNAME: process.env.SSH_USERNAME,
  SSH_IP: process.env.SSH_IP,
  SSH_KEY_PATH: process.env.SSH_KEY_PATH,
  DOWNLOAD_DIR: process.env.DOWNLOAD_DIR,
}