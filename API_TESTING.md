# User Registration API Testing

## Prerequisites

Make sure you have created the users table in your database by running the SQL command from `users_table.sql`.

## API Endpoints

## API Endpoints

### 1. Register a new user

```bash
curl -X POST http://localhost:4444/api/users/register
  -H "Content-Type: application/json"
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### 2. Login user

```bash
curl -X POST http://localhost:4444/api/users/login
  -H "Content-Type: application/json"
  -d '{
    "emailOrUsername": "john@example.com",
    "password": "securepassword123"
  }'
```

### 3. Get current user profile (requires authentication)

```bash
curl -X GET http://localhost:4444/api/users/profile
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 4. Get all users

```bash
curl -X GET http://localhost:4444/api/users
```

### 5. Get user by ID

```bash
curl -X GET http://localhost:4444/api/users/1
```

### 6. Update user

```bash
curl -X PUT http://localhost:4444/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johnsmith",
    "email": "johnsmith@example.com"
  }'
```

### 7. Delete user

```bash
curl -X DELETE http://localhost:4444/api/users/1
```

## Response Format

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Description of the result",
  "data": { /* Response data */ },
  "errors": [ /* Array of validation errors if any */ ]
}
```

## Example Responses

### Successful Registration

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2025-07-28T10:30:00.000Z",
    "updated_at": "2025-07-28T10:30:00.000Z"
  }
}
```

### Successful Login

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "created_at": "2025-07-28T10:30:00.000Z",
      "updated_at": "2025-07-28T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Invalid Login Credentials

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Protected Route Without Token

```json
{
  "success": false,
  "message": "Access token is required"
}
```

### Invalid/Expired Token

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "username is required",
    "email must be a valid email address",
    "password must be at least 6 characters long"
  ]
}
```

### User Already Exists

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```
