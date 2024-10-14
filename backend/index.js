require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Importa el paquete cors
const { Server } = require('socket.io'); // Importa Socket.IO si lo estás utilizando
const http = require('http'); // Importa el módulo http

// Importar Rutas
const companiesRoutes = require("./routes/companies");
const usersRoutes = require("./routes/users");
const projectsRoutes = require("./routes/projects");
const featuresRoutes = require("./routes/features");
const changeHistoryRoutes = require("./routes/changeHistory");
const usageLogsRoutes = require("./routes/usageLogs");
const checkFeatureRouter = require("./routes/checkFeature");

const app = express();
const port = process.env.PORT || 3000;

// Configurar CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Permitir solo tu frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Métodos permitidos
  credentials: true, // Permitir credenciales (cookies)
};

// Middleware
app.use(cors(corsOptions)); // Usar el middleware CORS
app.use(bodyParser.json()); // Para parsear JSON

// Usar Rutas
app.use("/companies", companiesRoutes);
app.use("/users", usersRoutes);
app.use("/projects", projectsRoutes);
app.use("/features", featuresRoutes);
app.use("/change-history", changeHistoryRoutes);
app.use("/usage-logs", usageLogsRoutes);
app.use("/v1/features", checkFeatureRouter);

// Crear un servidor HTTP usando el app de Express
let server = http.createServer(app);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

// Si estás usando WebSocket, inicializa aquí
const wss = new Server(server);
