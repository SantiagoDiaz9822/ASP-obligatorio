const express = require("express");
const router = express.Router();
const connection = require("../db");
const auth = require("../middleware/auth");
const redis = require("redis");
require("dotenv").config();
let isRedisConnected = false;

// Configura Redis usando la URL del archivo .env
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

// Conectar a Redis
redisClient
  .connect()
  .then(() => {
    console.log("Conectado a Redis");
    isRedisConnected = true;
  })
  .catch((err) => {
    // console.error("Error conectando a Redis");
    isRedisConnected = false;
  });

// Maneja los errores de Redis
redisClient.on("error", (err) => {
  // console.error("Error conectando a Redis");
  isRedisConnected = false;
});

// Rutas protegidas (usa el middleware)
router.use(auth);

// Ruta para obtener el reporte de uso
/**
 * @swagger
 * /usage/report:
 *   get:
 *     summary: Obtener un reporte de uso
 *     tags: [Usage]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: Fecha de inicio para el reporte
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: Fecha de fin para el reporte
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Reporte de uso obtenido exitosamente
 *       400:
 *         description: Se requieren las fechas de inicio y fin
 *       500:
 *         description: Error al obtener el reporte de uso
 */
router.get("/report", async (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.userId;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Se requieren las fechas de inicio y fin." });
  }

  const cacheKey = `usage_report_${userId}_${startDate}_${endDate}`;

  try {
    let cachedData;

    if (isRedisConnected) {
      cachedData = await redisClient.get(cacheKey);
    }

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

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

      if (isRedisConnected) {
        redisClient.setEx(cacheKey, 3600, JSON.stringify(results));
      }

      res.json(results);
    });
  } catch (error) {
    console.error("Error en la consulta o en el caché:", error);
    res.status(500).json({ message: "Error de servidor." });
  }
});

module.exports = router;
