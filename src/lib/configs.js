import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const {
  DB_PATH,
  DB_USERNAME,
  DB_PASSWORD,
  JWT_SECRET,
  PORT,
  TIMEOUT_DURATION,
  SSH_USERNAME,
  SSH_IP,
  SSH_KEY_PATH,
  DOWNLOAD_DIR,
} = process.env;

export {
  DB_PATH,
  DB_USERNAME,
  DB_PASSWORD,
  JWT_SECRET,
  PORT,
  TIMEOUT_DURATION,
  SSH_USERNAME,
  SSH_IP,
  SSH_KEY_PATH,
  DOWNLOAD_DIR,
};
