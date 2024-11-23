require("dotenv").config();
const mysql = require("mysql2");

// Crear una conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  port: process.env.RDS_PORT || 3306, // Usar el puerto configurado o 3306 por defecto
});

connection.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.stack);
    return;
  }
  console.log("Conectado a la base de datos MySQL");
});

module.exports = connection;
