const express = require("express");
const dotenv = require("dotenv");
const companyRoutes = require("./routes/companyRoutes");

dotenv.config();

const app = express();
app.use(express.json()); // Parsear JSON

// Rutas
app.use("/companies", companyRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
