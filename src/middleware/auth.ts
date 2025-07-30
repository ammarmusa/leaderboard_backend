import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    email: string;
    role: "superadmin" | "admin" | "user";
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token is required",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    req.user = decoded as {
      userId: number;
      username: string;
      email: string;
      role: "superadmin" | "admin" | "user";
    };

    next();
  });
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (
  allowedRoles: ("superadmin" | "admin" | "user")[]
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};
