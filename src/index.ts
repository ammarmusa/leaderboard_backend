import express from "express";
import {
  connectToDatabase,
  initializeState,
  watchJobChanges,
} from "./services/database";
import { initializeWorker } from "./workers/job.worker";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; // Import mysql2/promise

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Main endpoint
app.get("/", (req, res) => {
  res.send("Job Leaderboard Backend is running!");
});

// --- NEW API ROUTE TO GET ALL JOBS ---
app.get("/api/jobs", async (req, res) => {
  let dbConn;
  try {
    // Use the same dbConfig as the main connection
    const dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
    dbConn = await mysql.createConnection(dbConfig);
    const [rows] = await dbConn.execute("SELECT * FROM jobs ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  } finally {
    if (dbConn) {
      await dbConn.end();
    }
  }
});

const startServer = async () => {
  // 1. Connect to the database
  await connectToDatabase();

  // 2. Initialize the state for change detection
  await initializeState();

  // 3. Start the BullMQ worker
  initializeWorker();

  // 4. Start watching for database changes
  watchJobChanges();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
