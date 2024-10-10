const jwt = require("jsonwebtoken");
require("dotenv").config(); // Asegúrate de cargar las variables de entorno

const JWT_SECRET = process.env.JWT_SECRET; // Cargar el secreto desde .env

// Middleware para proteger rutas
const auth = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token no proporcionado." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido." });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role; // Almacena el rol del usuario
    next();
  });
};

module.exports = auth;
