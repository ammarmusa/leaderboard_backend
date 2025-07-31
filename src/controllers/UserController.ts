import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import jwt from "jsonwebtoken";

export class UserController {
  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { emailOrUsername, password } = req.body;

      // Validation
      if (!emailOrUsername || !password) {
        res.status(400).json({
          success: false,
          message: "Email/username and password are required",
        });
        return;
      }

      // Authenticate user
      const user = await User.authenticate(emailOrUsername, password);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        jwtSecret,
        { expiresIn: "24h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax", // "none" + secure:true if frontend/backend are different origins
        secure: false, // true in production (HTTPS)
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      res.json({
        success: true,
        message: "Login successful",
        data: { user: user }, // **do NOT include the token here anymore**
      });
      return;
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, role } = req.body;

      // Validation
      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          message: "Username, email, and password are required",
        });
        return;
      }

      // Role validation (only allow regular users to register as 'user')
      if (role && role !== "user") {
        res.status(403).json({
          success: false,
          message: "Only 'user' role is allowed for registration",
        });
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
        return;
      }

      // Password validation
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      // Check if user already exists
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }

      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
        return;
      }

      // Create new user (role defaults to 'user' in the model)
      const newUser = await User.create({
        username,
        email,
        password,
        role: "user",
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: newUser,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.findAll();

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update user
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const { username, email, password } = req.body;

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Validate email if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            message: "Please provide a valid email address",
          });
          return;
        }

        // Check if email is already taken by another user
        const userWithEmail = await User.findByEmail(email);
        if (userWithEmail && userWithEmail.id !== userId) {
          res.status(409).json({
            success: false,
            message: "Email is already taken by another user",
          });
          return;
        }
      }

      // Validate username if provided
      if (username) {
        const userWithUsername = await User.findByUsername(username);
        if (userWithUsername && userWithUsername.id !== userId) {
          res.status(409).json({
            success: false,
            message: "Username is already taken by another user",
          });
          return;
        }
      }

      // Validate password if provided
      if (password && password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      // Update user
      const updatedUser = await User.update(userId, {
        username,
        email,
        password,
      });

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Delete user
      const deleted = await User.delete(userId);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: "User deleted successfully",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to delete user",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get current user profile (requires authentication)
   */
  static async getProfile(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
