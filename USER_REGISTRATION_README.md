# User Registration System

This project implements a complete user registration CRUD system using the MVC (Model-View-Controller) pattern with TypeScript, Express.js, and MySQL.

## Project Structure

```
src/
├── controllers/
│   └── UserController.ts     # Handles HTTP requests and responses
├── models/
│   └── User.ts              # Database operations and business logic
├── routes/
│   └── userRoutes.ts        # Route definitions
├── middleware/
│   └── validation.ts        # Request validation middleware
└── index.ts                 # Main application entry point
```

## Features

- **Complete CRUD Operations**: Create, Read, Update, Delete users
- **Role-Based Access Control**: Three-tier role system (superadmin, admin, user)
- **User Authentication**: Login with JWT token generation
- **Password Security**: Bcrypt hashing with salt rounds
- **Input Validation**: Comprehensive validation middleware
- **Protected Routes**: Authentication and authorization middleware
- **Default Superadmin**: Automatic creation of default superadmin user
- **Error Handling**: Proper error responses and status codes
- **Database Integration**: MySQL with connection pooling
- **TypeScript**: Full type safety and intellisense
- **MVC Architecture**: Clean separation of concerns

## Database Schema

The users table includes:

- `id`: Auto-incrementing primary key
- `username`: Unique username (3-50 characters)
- `email`: Unique email address with format validation
- `password`: Bcrypt hashed password
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

## API Operations

### 1. User Registration

- **Endpoint**: `POST /api/users/register`
- **Validation**: Username (3-50 chars), valid email, password (6+ chars)
- **Security**: Password hashing, duplicate checking

### 2. User Login

- **Endpoint**: `POST /api/users/login`
- **Authentication**: Email/username and password
- **Response**: JWT token for subsequent requests

### 3. Get User Profile

- **Endpoint**: `GET /api/users/profile`
- **Authentication**: Requires valid JWT token
- **Returns**: Current user's profile information

### 4. Get All Users

- **Endpoint**: `GET /api/users`
- **Returns**: List of all users (excluding passwords)

### 5. Get User by ID

- **Endpoint**: `GET /api/users/:id`
- **Returns**: Single user details (excluding password)

### 6. Update User

- **Endpoint**: `PUT /api/users/:id`
- **Features**: Partial updates, duplicate checking, password rehashing

### 7. Delete User

- **Endpoint**: `DELETE /api/users/:id`
- **Returns**: Success confirmation

## Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Sanitization**: Validates all input fields
- **SQL Injection Prevention**: Uses parameterized queries
- **Email Validation**: Regex pattern matching
- **Duplicate Prevention**: Checks for existing users
- **Token Expiration**: 24-hour token validity

## Error Handling

- **400 Bad Request**: Invalid input or validation errors
- **401 Unauthorized**: Invalid login credentials
- **403 Forbidden**: Invalid or expired JWT token
- **404 Not Found**: User doesn't exist
- **409 Conflict**: Duplicate username/email
- **500 Internal Server Error**: Database or server errors

## Setup Instructions

1. **Create the database table**:

   ```sql
   -- Run the SQL commands from users_table.sql
   ```

2. **Install dependencies**:

   ```bash
   npm install bcrypt @types/bcrypt jsonwebtoken @types/jsonwebtoken
   ```

3. **Environment variables**:
   Make sure your `.env` file includes:

   ```
   DB_HOST=your_host
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=your_database
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

## Usage Examples

See `API_TESTING.md` for detailed curl commands and example responses.
