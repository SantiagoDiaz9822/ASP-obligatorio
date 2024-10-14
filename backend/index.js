require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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

// Configurar Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Feature Toggling",
      version: "1.0.0",
      description:
        "API para gestionar características utilizando feature toggles",
    },
  },
  apis: ["./routes/*.js"], // Rutas donde están definidas las anotaciones
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
