require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

// Importar Rutas
const companiesRoutes = require("./routes/companies");
const usersRoutes = require("./routes/users");
const projectsRoutes = require("./routes/projects");
const featuresRoutes = require("./routes/features");
const changeHistoryRoutes = require("./routes/changeHistory");
const usageLogsRoutes = require("./routes/usageLogs");
const checkFeatureRouter = require("./routes/checkFeature");
const healthRoutes = require("./routes/health");

const app = express();
const port = process.env.PORT || 3000;

// Configurar CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Usar Rutas
app.use("/companies", companiesRoutes);
app.use("/users", usersRoutes);
app.use("/projects", projectsRoutes);
app.use("/features", featuresRoutes);
app.use("/change-history", changeHistoryRoutes);
app.use("/usage-logs", usageLogsRoutes);
app.use("/v1/features", checkFeatureRouter);
app.use("/health", healthRoutes);

let server = http.createServer(app);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
const wss = new Server(server);
