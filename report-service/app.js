const express = require("express");
const dotenv = require("dotenv");
const reportRoutes = require("./routes/reportRoutes");

dotenv.config();

const app = express();
app.use(express.json()); // Parsear JSON

// Rutas
app.use("/reports", reportRoutes);

// Iniciar el servidor
const PORT = 3006;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
