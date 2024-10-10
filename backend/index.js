require("dotenv").config();
const mysql = require("mysql2");

// // Configurar la conexión a la base de datos
// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });

// // Conectar a la base de datos
// connection.connect((err) => {
//   if (err) {
//     console.error("Error conectando a la base de datos:", err.stack);
//     return;
//   }
//   console.log("Conectado a la base de datos MySQL en AWS RDS");
// });

const express = require("express");
const bodyParser = require("body-parser");
const companiesRoutes = require("./routes/companies"); // Importa las rutas

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json()); // Para parsear JSON

// Rutas
app.use("/companies", companiesRoutes); // Usa las rutas de companies

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

