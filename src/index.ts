import express from "express";
import cors from "cors";
import {
  connectToDatabase,
  initializeState,
  watchJobChanges,
} from "./services/database";
import { initializeWorker } from "./workers/job.worker";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; // Import mysql2/promise
import userRoutes from "./routes/userRoutes";
import { User } from "./models/User";
import { requestLogger } from "./middleware/requestLogger";
import Redis from "ioredis";

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || process.env.PORT || 3000;

// Configure CORS to allow requests from localhost:3333
app.use(cors({
  origin: 'http://localhost:3333',
  credentials: true
}));

app.use(express.json());

// Add request logging middleware
app.use(requestLogger);

// User routes
app.use("/api/users", userRoutes);

// Main endpoint
app.get("/", (req, res) => {
  res.send("Job Leaderboard Backend is running!");
});

// Health check endpoint
app.get("/health", async (req, res) => {
  const healthCheck = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: "unknown",
      redis: "unknown"
    }
  };

  // Check database connectivity
  try {
    const dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
    const dbConn = await mysql.createConnection(dbConfig);
    await dbConn.execute("SELECT 1");
    await dbConn.end();
    healthCheck.services.database = "healthy";
  } catch (error) {
    healthCheck.services.database = "unhealthy";
    healthCheck.status = "ERROR";
  }

  // Check Redis connectivity
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379"),
    });
    await redis.ping();
    await redis.disconnect();
    healthCheck.services.redis = "healthy";
  } catch (error) {
    healthCheck.services.redis = "unhealthy";
    healthCheck.status = "ERROR";
  }

  const statusCode = healthCheck.status === "OK" ? 200 : 503;
  res.status(statusCode).json(healthCheck);
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

  // 3. Create default superadmin user
  await User.createDefaultSuperadmin();

  // 4. Start the BullMQ worker
  initializeWorker();

  // 5. Start watching for database changes
  watchJobChanges();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
