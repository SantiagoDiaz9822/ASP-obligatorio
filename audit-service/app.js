const express = require("express");
require("dotenv").config();
const auditRoutes = require("./routes/auditRoutes");

const app = express();
app.use(express.json()); // Parsear JSON

// Rutas
app.use("/audit", auditRoutes);

// Iniciar el servidor
const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
