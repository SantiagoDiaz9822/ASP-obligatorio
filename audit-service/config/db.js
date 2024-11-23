const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.RDS_HOSTNAME, // Endpoint de RDS
  user: process.env.RDS_USERNAME, // Usuario de RDS
  password: process.env.RDS_PASSWORD, // Contraseña de RDS
  database: process.env.RDS_DATABASE, // Nombre de la base de datos
});

connection.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err);
    process.exit(1);
  }
  console.log("Conexión exitosa a la base de datos.");
});

module.exports = connection;
