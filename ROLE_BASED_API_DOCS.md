# Complete User API Documentation with Role System

## Prerequisites

1. Create the users table by running the SQL commands from `users_table.sql`
2. The default superadmin user will be created automatically on server start

## Default Credentials

- **Superadmin**:
  - Email: `itsammarmusa@gmail.com`
  - Username: `superadmin`
  - Password: `H3h3h3h3!`

## Role System

- **superadmin**: Full access to all operations
- **admin**: Can view, update, and delete users (except superadmin operations)
- **user**: Default role, can only access own profile

## API Endpoints

### 1. User Registration (Public)

```bash
curl -X POST http://localhost:4444/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

- **Role**: Always creates users with 'user' role
- **Access**: Public (no authentication required)

### 2. User Login (Public)

```bash
# Regular user login
curl -X POST http://localhost:4444/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "john@example.com",
    "password": "securepassword123"
  }'

# Superadmin login
curl -X POST http://localhost:4444/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "itsammarmusa@gmail.com",
    "password": "H3h3h3h3!"
  }'
```

- **Access**: Public (no authentication required)
- **Returns**: JWT token with user info and role

### 3. Get Current User Profile (Protected)

```bash
curl -X GET http://localhost:4444/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

- **Access**: All authenticated users
- **Returns**: Current user's profile information

### 4. Get All Users (Admin/Superadmin Only)

```bash
curl -X GET http://localhost:4444/api/users \
  -H "Authorization: Bearer ADMIN_OR_SUPERADMIN_TOKEN"
```

- **Access**: Admin and Superadmin only
- **Returns**: List of all users

### 5. Get User by ID (Admin/Superadmin Only)

```bash
curl -X GET http://localhost:4444/api/users/1 \
  -H "Authorization: Bearer ADMIN_OR_SUPERADMIN_TOKEN"
```

- **Access**: Admin and Superadmin only
- **Returns**: Specific user details

### 6. Update User (Admin/Superadmin Only)

```bash
curl -X PUT http://localhost:4444/api/users/1 \
  -H "Authorization: Bearer ADMIN_OR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johnsmith",
    "email": "johnsmith@example.com",
    "role": "admin"
  }'
```

- **Access**: Admin and Superadmin only
- **Note**: Can update role, username, email, and password

### 7. Delete User (Superadmin Only)

```bash
curl -X DELETE http://localhost:4444/api/users/1 \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"
```

- **Access**: Superadmin only
- **Action**: Permanently deletes user

## Response Examples

### Successful Login with Role

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
      "created_at": "2025-07-28T10:30:00.000Z",
      "updated_at": "2025-07-28T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Insufficient Permissions Error

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Role Validation Error (Registration)

```json
{
  "success": false,
  "message": "Only 'user' role is allowed for registration"
}
```

## Testing Sequence

1. **Start server** and verify superadmin creation
2. **Login as superadmin** to get admin token
3. **Register regular user** (automatically gets 'user' role)
4. **Login as regular user** to get user token
5. **Test role-based access** with different tokens

## JWT Token Structure

The JWT token includes:

```json
{
  "userId": 1,
  "username": "superadmin",
  "email": "itsammarmusa@gmail.com",
  "role": "superadmin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Security Notes

- Only superadmins can delete users
- Only admins and superadmins can view all users
- Regular users can only access their own profile
- Role cannot be set during registration (always 'user')
- Role can only be updated by admins/superadmins
