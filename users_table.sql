-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Add indexes for better performance
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);

-- Add some constraints for data validation
ALTER TABLE users 
ADD CONSTRAINT chk_username_length CHECK (CHAR_LENGTH(username) >= 3),
ADD CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

-- Insert default superadmin user
INSERT INTO users (username, email, password, role) 
SELECT 'superadmin', 'itsammarmusa@gmail.com', '$2b$12$CHCtbhzXZ13AXvlzErdUD.yanj1ZSiVeIT.fI65yKAQuKPiGhNejK', 'superadmin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'itsammarmusa@gmail.com'
);

-- Note: The password hash above is for 'H3h3h3h3!' using bcrypt with 12 salt rounds
