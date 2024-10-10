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

// Importar Rutas
const companiesRoutes = require("./routes/companies");
const usersRoutes = require("./routes/users");
const projectsRoutes = require("./routes/projects");
const featuresRoutes = require("./routes/features");
const changeHistoryRoutes = require("./routes/changeHistory");
const usageLogsRoutes = require("./routes/usageLogs");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json()); // Para parsear JSON

// Usar Rutas
app.use("/companies", companiesRoutes);
app.use("/users", usersRoutes);
app.use("/projects", projectsRoutes);
app.use("/features", featuresRoutes);
app.use("/change-history", changeHistoryRoutes);
app.use("/usage-logs", usageLogsRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
