# Login API Test Instructions

## Quick Test Sequence

1. **Start the server**:

   ```bash
   npm run dev
   ```

2. **Register a test user**:

   ```bash
   curl -X POST http://localhost:4444/api/users/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "testpass123"
     }'
   ```

3. **Login with the test user**:

   ```bash
   curl -X POST http://localhost:4444/api/users/login \
     -H "Content-Type: application/json" \
     -d '{
       "emailOrUsername": "test@example.com",
       "password": "testpass123"
     }'
   ```

4. **Copy the JWT token from the login response and test the protected route**:
   ```bash
   curl -X GET http://localhost:4444/api/users/profile \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Expected Results

### Registration Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "created_at": "2025-07-28T...",
    "updated_at": "2025-07-28T..."
  }
}
```

### Login Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "created_at": "2025-07-28T...",
      "updated_at": "2025-07-28T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Profile Response (with valid token):

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "created_at": "2025-07-28T...",
    "updated_at": "2025-07-28T..."
  }
}
```

## Error Cases to Test

### Invalid login credentials:

```bash
curl -X POST http://localhost:4444/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "wrongpassword"
  }'
```

### Missing authentication token:

```bash
curl -X GET http://localhost:4444/api/users/profile
```

### Invalid token:

```bash
curl -X GET http://localhost:4444/api/users/profile \
  -H "Authorization: Bearer invalid_token_here"
```
