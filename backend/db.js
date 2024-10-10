require("dotenv").config(); // Cargar variables de entorno desde el archivo .env
const mysql = require("mysql2");

// Crear una conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Si no has definido el puerto, por defecto es 3306
});

// Verificar si la conexión fue exitosa
connection.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.stack);
    return;
  }
  console.log("Conectado a la base de datos MySQL");
});

module.exports = connection;
