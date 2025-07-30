# Role System Test Guide

## Quick Test of Role-Based System

### 1. Start the Server

```bash
npm run dev
```

Look for the message: "Default superadmin user created successfully" or "Default superadmin user already exists"

### 2. Test Superadmin Login

```bash
curl -X POST http://localhost:4444/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "itsammarmusa@gmail.com",
    "password": "H3h3h3h3!"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "superadmin",
      "email": "itsammarmusa@gmail.com",
      "role": "superadmin",
      "created_at": "...",
      "updated_at": "..."
    },
    "token": "eyJ..."
  }
}
```

### 3. Test Protected Route with Superadmin Token

```bash
# Copy the token from step 2 and use it here
curl -X GET http://localhost:4444/api/users \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN_HERE"
```

### 4. Register a Regular User

```bash
curl -X POST http://localhost:4444/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### 5. Login as Regular User

```bash
curl -X POST http://localhost:4444/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "testpass123"
  }'
```

### 6. Test Role Restriction

Try to access admin-only route with regular user token:

```bash
# This should return "Insufficient permissions"
curl -X GET http://localhost:4444/api/users \
  -H "Authorization: Bearer REGULAR_USER_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 7. Test Profile Access (Should Work for Regular User)

```bash
curl -X GET http://localhost:4444/api/users/profile \
  -H "Authorization: Bearer REGULAR_USER_TOKEN_HERE"
```

## Role Permissions Summary

| Action           | User | Admin | Superadmin |
| ---------------- | ---- | ----- | ---------- |
| Register         | ✅   | ✅    | ✅         |
| Login            | ✅   | ✅    | ✅         |
| View Own Profile | ✅   | ✅    | ✅         |
| View All Users   | ❌   | ✅    | ✅         |
| View User by ID  | ❌   | ✅    | ✅         |
| Update Users     | ❌   | ✅    | ✅         |
| Delete Users     | ❌   | ❌    | ✅         |

## Default Credentials

- **Email**: `itsammarmusa@gmail.com`
- **Username**: `superadmin`
- **Password**: `H3h3h3h3!`
- **Role**: `superadmin`
