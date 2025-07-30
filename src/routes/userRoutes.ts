import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { validateRequest } from "../middleware/validation";
import { authenticateToken, requireRole } from "../middleware/auth";
// Uncomment the line below if you want to add route-specific logging
// import { simpleRequestLogger } from "../middleware/requestLogger";

const router = Router();

// Validation rules for user registration
const registerValidation = validateRequest([
  {
    field: "username",
    required: true,
    type: "string",
    minLength: 3,
    maxLength: 50,
  },
  { field: "email", required: true, type: "email", maxLength: 100 },
  {
    field: "password",
    required: true,
    type: "string",
    minLength: 6,
    maxLength: 100,
  },
]);

// Validation rules for user login
const loginValidation = validateRequest([
  { field: "emailOrUsername", required: true, type: "string" },
  { field: "password", required: true, type: "string" },
]);

// Validation rules for user update
const updateValidation = validateRequest([
  { field: "username", type: "string", minLength: 3, maxLength: 50 },
  { field: "email", type: "email", maxLength: 100 },
  { field: "password", type: "string", minLength: 6, maxLength: 100 },
]);

// POST /api/users/register - Register a new user
router.post("/register", registerValidation, UserController.register);

// POST /api/users/login - Login user
router.post("/login", loginValidation, UserController.login);

// GET /api/users/profile - Get current user profile (protected route)
router.get("/profile", authenticateToken, UserController.getProfile);

// GET /api/users - Get all users (admin and superadmin only)
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  UserController.getAllUsers
);

// GET /api/users/:id - Get user by ID (admin and superadmin only)
router.get(
  "/:id",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  UserController.getUserById
);

// PUT /api/users/:id - Update user (admin and superadmin only)
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin", "superadmin"]),
  updateValidation,
  UserController.updateUser
);

// DELETE /api/users/:id - Delete user (superadmin only)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["superadmin"]),
  UserController.deleteUser
);

export default router;
