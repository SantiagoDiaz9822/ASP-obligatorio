const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos
const auth = require("../middleware/auth"); // Middleware de autenticación
const redis = require("redis"); // Importa Redis para caching
require("dotenv").config();

// Configura Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

// Asegúrate de conectar el cliente antes de usarlo
redisClient.connect();

// Rutas protegidas (usa el middleware)
router.use(auth);

// Ruta para obtener el reporte de uso
router.get("/report", async (req, res) => {
  const { startDate, endDate } = req.query; // Obtener las fechas desde los parámetros de la consulta
  const userId = req.userId; // Obtener el ID del usuario

  // Verificar que se proporcionen las fechas
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Se requieren las fechas de inicio y fin." });
  }

  // Genera una clave única para el cache basada en los parámetros de la consulta
  const cacheKey = `usage_report_${userId}_${startDate}_${endDate}`;

  try {
    // Primero, revisa el cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      // Si los datos están en cache, retorna los resultados
      return res.json(JSON.parse(cachedData));
    }

    // Consulta para obtener el reporte de uso agrupado por proyecto y feature
    const query = `
      SELECT 
        p.name AS project_name,
        f.feature_key,
        COUNT(ul.id) AS usage_count
      FROM 
        usage_logs ul
      JOIN 
        features f ON ul.feature_id = f.id
      JOIN 
        projects p ON f.project_id = p.id
      WHERE 
        ul.created_at BETWEEN ? AND ?
        AND p.company_id = (SELECT company_id FROM users WHERE id = ?)
      GROUP BY 
        p.name, f.feature_key
      ORDER BY 
        p.name, f.feature_key
    `;

    connection.query(query, [startDate, endDate, userId], (err, results) => {
      if (err) {
        console.error("Error al obtener el reporte de uso:", err);
        return res
          .status(500)
          .json({ message: "Error al obtener el reporte de uso." });
      }

      // Almacenar el resultado en cache con una expiración de 1 hora
      redisClient.setEx(cacheKey, 3600, JSON.stringify(results));

      res.json(results);
    });
  } catch (error) {
    console.error("Error en la consulta o en el caché:", error);
    res.status(500).json({ message: "Error de servidor." });
  }
});

module.exports = router;
