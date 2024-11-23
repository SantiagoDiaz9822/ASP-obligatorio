const express = require("express");
const dotenv = require("dotenv");
const featureRoutes = require("./routes/featureRoutes");

dotenv.config();

const app = express();
app.use(express.json()); // Parsear JSON

// Rutas
app.use("/features", featureRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
