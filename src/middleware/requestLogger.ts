import { Request, Response, NextFunction } from "express";

/**
 * Logging middleware to track API requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Get request information
  const method = req.method;
  const url = req.originalUrl || req.url;
  const origin = req.get("Origin") || req.get("Referer") || req.ip || "Unknown";
  const userAgent = req.get("User-Agent") || "Unknown";

  console.log(`🌐 Incoming ${method} request to ${url} from ${origin}`);

  // Capture the original json method
  const originalJson = res.json;
  res.json = function (body: any) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const timestamp = new Date().toISOString();

    // Log the request details
    console.log(`
╭─────────────────────────────────────────────────────────────
│ 🌐 API REQUEST LOG
├─────────────────────────────────────────────────────────────
│ Method:       ${method}
│ Status:       ${getStatusCodeEmoji(statusCode)} ${statusCode}
│ URL:          ${url}
│ Origin:       ${origin}
│ User-Agent:   ${userAgent}
│ Response Time: ${responseTime}ms
│ Timestamp:    ${timestamp}
╰─────────────────────────────────────────────────────────────
    `);

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Get emoji based on status code
 */
function getStatusCodeEmoji(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return "✅"; // Success
  } else if (statusCode >= 300 && statusCode < 400) {
    return "🔄"; // Redirect
  } else if (statusCode >= 400 && statusCode < 500) {
    return "⚠️"; // Client Error
  } else if (statusCode >= 500) {
    return "❌"; // Server Error
  }
  return "📝"; // Other
}

/**
 * Simplified console logger for production
 */
export const simpleRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  const originalJson = res.json;
  res.json = function (body: any) {
    const responseTime = Date.now() - startTime;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    const origin =
      req.get("Origin") || req.get("Referer") || req.ip || "Unknown";

    console.log(
      `[${new Date().toISOString()}] ${method} ${url} - ${statusCode} - ${responseTime}ms - Origin: ${origin}`
    );

    return originalJson.call(this, body);
  };

  next();
};
