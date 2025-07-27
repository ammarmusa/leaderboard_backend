import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisConnection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

export const jobQueue = new Queue("job-updates", {
  connection: redisConnection,
});
