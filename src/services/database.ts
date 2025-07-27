import mysql from "mysql2/promise";
import { jobQueue } from "../queues/job.queue";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let connection: mysql.Connection;

// Function to connect to the database
export const connectToDatabase = async () => {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

// This is a mock function to simulate database change detection.
// In a real-world scenario, you would use database triggers,
// a Change Data Capture (CDC) system like Debezium, or listen to the binary log (binlog).
// For simplicity, we'll poll the database every few seconds to check for changes.
let lastMaxId = 0;
let lastJobStatuses = new Map<number, string>();

export const watchJobChanges = async () => {
  if (!connection) {
    console.error("Database connection not established.");
    return;
  }

  try {
    // 1. Check for new jobs
    const [newJobs] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM jobs WHERE id > ?`,
      [lastMaxId]
    );

    if (newJobs.length > 0) {
      for (const job of newJobs) {
        console.log(`New job detected: ID ${job.id}`);
        await jobQueue.add("new-job", { jobId: job.id });
        if (job.id > lastMaxId) {
          lastMaxId = job.id;
        }
        lastJobStatuses.set(job.id, job.status);
      }
    }

    // 2. Check for status updates in existing jobs
    const [allJobs] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT id, status FROM jobs WHERE id <= ?`,
      [lastMaxId]
    );

    for (const job of allJobs) {
      const oldStatus = lastJobStatuses.get(job.id);
      if (oldStatus && oldStatus !== job.status) {
        console.log(
          `Job ID ${job.id} status changed from ${oldStatus} to ${job.status}`
        );
        await jobQueue.add("status-update", {
          jobId: job.id,
          newStatus: job.status,
        });
        lastJobStatuses.set(job.id, job.status);
      }
    }
  } catch (error) {
    console.error("Error watching for job changes:", error);
  }

  // Poll every 5 seconds
  setTimeout(watchJobChanges, 5000);
};

// Initialize the state on startup
export const initializeState = async () => {
  if (!connection) await connectToDatabase();
  const [jobs] = await connection.execute<mysql.RowDataPacket[]>(
    `SELECT id, status FROM jobs`
  );
  if (jobs.length > 0) {
    lastMaxId = Math.max(...jobs.map((j) => j.id));
    jobs.forEach((job) => lastJobStatuses.set(job.id, job.status));
    console.log(`Initial state loaded. Last Job ID: ${lastMaxId}`);
  }
};
