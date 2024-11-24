CREATE DATABASE userdb;
USE userdb;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL,
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Insertar un usuario admin
INSERT INTO users (company_id, email, password_hash, role, first_login)
VALUES (1, 'admin@example.com', 'hashed_password', 'admin', TRUE);

SELECT * FROM users