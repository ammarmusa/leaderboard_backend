# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Node.js/TypeScript backend for a job leaderboard application with real-time job tracking and user management capabilities.

### Core Components

- **Express.js REST API** - Main application server with user authentication and job endpoints
- **MySQL Database** - Primary data storage for users and jobs tables
- **Redis + BullMQ** - Job queue system for processing database changes and webhook notifications
- **Role-based Authentication** - JWT-based auth with superadmin/admin/user roles
- **Real-time Job Monitoring** - Polling-based change detection with webhook notifications

### Key Architecture Patterns

- **Database-per-feature pattern** - Each model (User) manages its own database connections
- **Worker Queue Pattern** - Database changes trigger background jobs for webhook notifications
- **Polling-based Change Detection** - `watchJobChanges()` polls every 5 seconds for new jobs and status updates
- **Webhook Integration** - Changes are pushed to frontend via configurable webhook URL

## Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# No tests configured yet
npm test  # Currently returns error
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Required Database Configuration
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# Server Configuration
APP_PORT=4444  # Primary port
PORT=3000      # Fallback port

# Redis Configuration (required for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Webhook Integration
FRONTEND_WEBHOOK_URL=http://your-frontend-webhook-endpoint
```

## Database Schema

The application expects two main tables:

- **users** - Created via `users_table.sql`, with role-based access (superadmin/admin/user)
- **jobs** - Primary table monitored for changes, structure referenced in `src/services/database.ts:42-44`

## Key Implementation Details

### Default Superadmin User
- On startup, creates default superadmin user if not exists
- Credentials: `superadmin` / `itsammarmusa@gmail.com` / `H3h3h3h3!`
- Located in `src/models/User.ts:270-300`

### Job Change Detection
- Polling-based system checks for new jobs and status updates every 5 seconds
- Maintains state via `lastMaxId` and `lastJobStatuses` Map
- Triggers BullMQ jobs for webhook notifications
- Implementation in `src/services/database.ts:34-83`

### Authentication Flow
- JWT tokens with 24h expiration
- Supports login via email or username
- Role-based middleware for endpoint protection
- Password hashing with bcrypt (saltRounds: 12)

### API Structure
- User routes: `/api/users/*` (registration, login, profile management)
- Job routes: `/api/jobs` (GET endpoint for listing all jobs)
- Request logging middleware applies to all routes

## File Structure Context

- `src/models/User.ts` - Complete user CRUD operations with authentication
- `src/services/database.ts` - Database connection and job change monitoring
- `src/queues/job.queue.ts` - BullMQ queue configuration
- `src/workers/job.worker.ts` - Background job processor for webhooks
- `src/middleware/` - Authentication, validation, and request logging
- `src/controllers/UserController.ts` - User management endpoints
- `src/routes/userRoutes.ts` - User route definitions

## Development Notes

- No test framework currently configured
- Uses polling instead of database triggers for change detection
- Each database operation creates a new connection (no connection pooling)
- Webhook failures will cause job failures but no automatic retry logic
- TypeScript compiled to `dist/` directory with CommonJS modules