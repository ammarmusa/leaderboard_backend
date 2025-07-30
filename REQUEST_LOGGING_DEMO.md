# Request Logging Demo

The request logging middleware will automatically log all API requests with detailed information.

## What Gets Logged

For each API request, you'll see:

- **Method**: HTTP method (GET, POST, PUT, DELETE)
- **Status**: Response status code with emoji indicator
- **URL**: The requested endpoint
- **Origin**: Where the request came from (IP, domain, or 'Unknown')
- **User-Agent**: Browser/client information
- **Response Time**: How long the request took in milliseconds
- **Timestamp**: When the request was processed

## Example Console Output

When you make requests to your API, you'll see something like this:

```
🌐 Incoming POST request to /api/users/login from 127.0.0.1

╭─────────────────────────────────────────────────────────────
│ 🌐 API REQUEST LOG
├─────────────────────────────────────────────────────────────
│ Method:       POST
│ Status:       ✅ 200
│ URL:          /api/users/login
│ Origin:       127.0.0.1
│ User-Agent:   curl/7.68.0
│ Response Time: 145ms
│ Timestamp:    2025-07-28T15:30:45.123Z
╰─────────────────────────────────────────────────────────────
```

## Status Code Emojis

- ✅ **200-299**: Success responses
- 🔄 **300-399**: Redirect responses
- ⚠️ **400-499**: Client error responses
- ❌ **500-599**: Server error responses
- 📝 **Other**: Any other status codes

## Test the Logging

1. **Start your server**:

   ```bash
   npm run dev
   ```

2. **Make some API requests**:

   ```bash
   # Register a user
   curl -X POST http://localhost:4444/api/users/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

   # Login
   curl -X POST http://localhost:4444/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"emailOrUsername":"test@example.com","password":"testpass123"}'

   # Get profile (with token)
   curl -X GET http://localhost:4444/api/users/profile \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **Watch the console** for the detailed logs!

## Production vs Development

- **Development**: Uses `requestLogger` with detailed formatting
- **Production**: You can switch to `simpleRequestLogger` for more concise logs

To use the simple logger instead, change in `index.ts`:

```typescript
// Replace this:
app.use(requestLogger);

// With this:
app.use(simpleRequestLogger);
```

The simple logger output looks like:

```
[2025-07-28T15:30:45.123Z] POST /api/users/login - 200 - 145ms - Origin: 127.0.0.1
```
