CREATE DATABASE reportdb;
USE reportdb;

CREATE TABLE usage_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  feature_id INT,
  project_id INT NOT NULL,
  context JSON,
  response BOOLEAN,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  hour_window DATETIME GENERATED ALWAYS AS (DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')) STORED
);

SELECT * FROM usage_logs ul 