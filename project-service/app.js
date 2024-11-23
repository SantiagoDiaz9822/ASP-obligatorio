const express = require("express");
const dotenv = require("dotenv");
const projectRoutes = require("./routes/projectRoutes");

dotenv.config();

const app = express();
app.use(express.json()); // Parsear JSON

// Rutas
app.use("/projects", projectRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
