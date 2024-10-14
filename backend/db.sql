-- Tabla: companies
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(500) NOT NULL,
  logo_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) 

-- Tabla: users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT, 
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL,
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- Tabla: projects
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) 

-- Tabla: features
CREATE TABLE features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  feature_key VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  conditions JSON,
  state ENUM('on', 'off') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
)

-- Tabla: change_history
CREATE TABLE change_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  feature_id INT,
  user_id INT,
  action VARCHAR(50),
  changed_fields JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (feature_id) REFERENCES features(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla: usage_logs
CREATE TABLE usage_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  feature_id INT,
  project_id INT,
  context JSON,
  response BOOLEAN,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);