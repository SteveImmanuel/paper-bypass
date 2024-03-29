// @ts-nocheck
import sqlite3 from 'sqlite3';
import { hashSync } from 'bcrypt';
import { DB_PASSWORD, DB_USERNAME } from '$lib/configs';

const jobStatus = {
  PENDING: 0,
  IN_PROGRESS: 1,
  SUCCESS: 2,
  FAILED: 3,
};

class Database {
  constructor(dbPath = ':memory:') {
    if (Database.instance) {
      return Database.instance;
    }
    Database.instance = this;

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
                job_id INTEGER PRIMARY KEY,
                link TEXT,
                status INTEGER, -- 0: pending, 1: in progress, 2: success, 3: failed
                path TEXT,
                created_at TEXT,
                updated_at TEXT
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
        const hashedPassword = hashSync(DB_PASSWORD, 10);
        await this.run('INSERT INTO users (username, password) VALUES (?, ?)', [DB_USERNAME, hashedPassword]);
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

  async createJob(jobId, link) {
    await this.run('INSERT INTO jobs (job_id, status, link, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [jobId, 1, link, new Date().toISOString(), new Date().toISOString()]);
  }

  async updateJobStatus(jobId, status, path = null) {
    if (status === jobStatus.SUCCESS) {
      await this.run('UPDATE jobs SET status = ?, path = ?, updated_at = ? WHERE job_id = ?', [status, path, new Date().toISOString(), jobId]);
    } else {
      await this.run('UPDATE jobs SET status = ?, updated_at = ? WHERE job_id = ?', [status, new Date().toISOString(), jobId]);
    }
  }

  async getJobById(jobId) {
    const row = await this.get('SELECT * FROM jobs WHERE job_id = ?', [jobId]);
    if (!row) {
      return null;
    }
    return row;
  }

  async getTotalInProgressJobs() {
    const row = await this.get('SELECT COUNT(*) as count FROM jobs WHERE status = ?', [jobStatus.IN_PROGRESS]);
    return row.count;
  }

  async getAllJobs() {
    const rows = await this.all('SELECT * FROM jobs ORDER BY created_at DESC');
    return rows;
  }

  async getAllPendingJobs() {
    const rows = await this.all('SELECT * FROM jobs WHERE status = ? ORDER BY created_at DESC', [jobStatus.PENDING]);
    return rows;
  }
}

export {
  Database,
  jobStatus
};