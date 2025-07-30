-- ALTER TABLE statement to add role column to existing users table
-- Use this if you already have a users table without the role column

-- Add role column with ENUM constraint and default value
ALTER TABLE users 
ADD COLUMN role ENUM('superadmin', 'admin', 'user') DEFAULT 'user' AFTER password;

-- Add index for role column for better performance
ALTER TABLE users 
ADD INDEX idx_role (role);

-- Update any existing users to have 'user' role (if not already set)
UPDATE users 
SET role = 'user' 
WHERE role IS NULL;

-- Insert default superadmin user if it doesn't exist
INSERT INTO users (username, email, password, role) 
SELECT 'superadmin', 'itsammarmusa@gmail.com', '$2b$12$CHCtbhzXZ13AXvlzErdUD.yanj1ZSiVeIT.fI65yKAQuKPiGhNejK', 'superadmin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'itsammarmusa@gmail.com' OR username = 'superadmin'
);

-- Note: The password hash above is for 'H3h3h3h3!' using bcrypt with 12 salt rounds
