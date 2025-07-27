import { Worker } from "bullmq";
import axios from "axios";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const redisConnectionWorker = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

const dbConfigWorker = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const frontendWebhookUrl = process.env.FRONTEND_WEBHOOK_URL;

export const initializeWorker = () => {
  const worker = new Worker(
    "job-updates",
    async (job) => {
      console.log(`Processing job ${job.id} of type ${job.name}`);

      if (!frontendWebhookUrl) {
        console.error(
          "FRONTEND_WEBHOOK_URL is not defined. Cannot send webhook."
        );
        return;
      }

      let dbConn;
      try {
        dbConn = await mysql.createConnection(dbConfigWorker);

        // NOTE: The SQL query has been updated to match the schema you provided.
        // The JOIN on the 'companies' table was removed as the 'jobs' table
        // schema does not contain a 'company_id'.
        const [rows] = await dbConn.execute<mysql.RowDataPacket[]>(
          `SELECT * FROM jobs WHERE id = ?`,
          [job.data.jobId]
        );

        if (rows.length > 0) {
          const jobData = rows[0];
          const payload = {
            event: job.name, // 'new-job' or 'status-update'
            data: jobData,
          };

          console.log("Sending webhook to:", frontendWebhookUrl);
          await axios.post(frontendWebhookUrl, payload);
          console.log(`Webhook for job ${job.data.jobId} sent successfully.`);
        }
      } catch (error) {
        console.error(`Failed to process job ${job.id}:`, error);
        // In a production app, you might want to retry the job
        throw error;
      } finally {
        if (dbConn) {
          await dbConn.end();
        }
      }
    },
    { connection: redisConnectionWorker }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed!`);
  });

  worker.on("failed", (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
  });

  console.log("Job worker initialized.");
};
