import { Request, Response, NextFunction } from "express";

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: "string" | "number" | "email";
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Check if required field is missing
      if (
        rule.required &&
        (!value || (typeof value === "string" && value.trim() === ""))
      ) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      // Skip validation if field is not provided and not required
      if (!value) continue;

      // Type validation
      if (rule.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${rule.field} must be a valid email address`);
        }
      } else if (rule.type === "number") {
        if (isNaN(Number(value))) {
          errors.push(`${rule.field} must be a number`);
        }
      } else if (rule.type === "string" && typeof value !== "string") {
        errors.push(`${rule.field} must be a string`);
      }

      // Length validation
      if (typeof value === "string") {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(
            `${rule.field} must be at least ${rule.minLength} characters long`
          );
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(
            `${rule.field} must be no more than ${rule.maxLength} characters long`
          );
        }
      }

      // Pattern validation
      if (
        rule.pattern &&
        typeof value === "string" &&
        !rule.pattern.test(value)
      ) {
        errors.push(`${rule.field} format is invalid`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
      return;
    }

    next();
  };
};
