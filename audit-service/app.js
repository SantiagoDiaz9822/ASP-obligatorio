const express = require("express");
const dotenv = require("dotenv");
const auditRoutes = require("./routes/auditRoutes");

dotenv.config();

const app = express();
app.use(express.json()); // Parsear JSON

// Rutas
app.use("/audit", auditRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
