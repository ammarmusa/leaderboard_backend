import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

export interface IUser {
  id?: number;
  username: string;
  email: string;
  password: string;
  role?: "superadmin" | "admin" | "user";
  created_at?: Date;
  updated_at?: Date;
}

export interface IUserResponse {
  id: number;
  username: string;
  email: string;
  role: "superadmin" | "admin" | "user";
  created_at: Date;
  updated_at: Date;
}

export class User {
  private static dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  private static async getConnection(): Promise<mysql.Connection> {
    return await mysql.createConnection(this.dbConfig);
  }

  /**
   * Create a new user
   */
  static async create(
    userData: Omit<IUser, "id" | "created_at" | "updated_at">
  ): Promise<IUserResponse> {
    const connection = await this.getConnection();

    try {
      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Set default role if not provided
      const role = userData.role || "user";

      const [result] = await connection.execute<mysql.ResultSetHeader>(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [userData.username, userData.email, hashedPassword, role]
      );

      // Fetch the created user
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?",
        [result.insertId]
      );

      return rows[0] as IUserResponse;
    } finally {
      await connection.end();
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    const connection = await this.getConnection();

    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      return rows.length > 0 ? (rows[0] as IUser) : null;
    } finally {
      await connection.end();
    }
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<IUser | null> {
    const connection = await this.getConnection();

    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      return rows.length > 0 ? (rows[0] as IUser) : null;
    } finally {
      await connection.end();
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<IUserResponse | null> {
    const connection = await this.getConnection();

    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?",
        [id]
      );

      return rows.length > 0 ? (rows[0] as IUserResponse) : null;
    } finally {
      await connection.end();
    }
  }

  /**
   * Get all users
   */
  static async findAll(): Promise<IUserResponse[]> {
    const connection = await this.getConnection();

    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC"
      );

      return rows as IUserResponse[];
    } finally {
      await connection.end();
    }
  }

  /**
   * Update user
   */
  static async update(
    id: number,
    userData: Partial<Omit<IUser, "id" | "created_at" | "updated_at">>
  ): Promise<IUserResponse | null> {
    const connection = await this.getConnection();

    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (userData.username) {
        updates.push("username = ?");
        values.push(userData.username);
      }

      if (userData.email) {
        updates.push("email = ?");
        values.push(userData.email);
      }

      if (userData.password) {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        updates.push("password = ?");
        values.push(hashedPassword);
      }

      if (userData.role) {
        updates.push("role = ?");
        values.push(userData.role);
      }

      if (updates.length === 0) {
        throw new Error("No fields to update");
      }

      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      await connection.execute(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      // Return updated user
      return await this.findById(id);
    } finally {
      await connection.end();
    }
  }

  /**
   * Delete user
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await this.getConnection();

    try {
      const [result] = await connection.execute<mysql.ResultSetHeader>(
        "DELETE FROM users WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } finally {
      await connection.end();
    }
  }

  /**
   * Verify password
   */
  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Authenticate user with email/username and password
   */
  static async authenticate(
    emailOrUsername: string,
    password: string
  ): Promise<IUserResponse | null> {
    const connection = await this.getConnection();

    try {
      // Check if login credential is email or username
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ? OR username = ?",
        [emailOrUsername, emailOrUsername]
      );

      if (rows.length === 0) {
        return null; // User not found
      }

      const user = rows[0] as IUser;

      // Verify password
      const isPasswordValid = await this.verifyPassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return null; // Invalid password
      }

      // Return user without password
      return {
        id: user.id!,
        username: user.username,
        email: user.email,
        role: user.role || "user",
        created_at: user.created_at!,
        updated_at: user.updated_at!,
      };
    } finally {
      await connection.end();
    }
  }

  /**
   * Create default superadmin user if it doesn't exist
   */
  static async createDefaultSuperadmin(): Promise<void> {
    const connection = await this.getConnection();

    try {
      // Check if superadmin already exists
      const [existing] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ? OR username = ?",
        ["itsammarmusa@gmail.com", "superadmin"]
      );

      if (existing.length > 0) {
        console.log("Default superadmin user already exists");
        return;
      }

      // Create superadmin user
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash("H3h3h3h3!", saltRounds);

      await connection.execute<mysql.ResultSetHeader>(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        ["superadmin", "itsammarmusa@gmail.com", hashedPassword, "superadmin"]
      );

      console.log("Default superadmin user created successfully");
    } catch (error) {
      console.error("Error creating default superadmin user:", error);
    } finally {
      await connection.end();
    }
  }
}
