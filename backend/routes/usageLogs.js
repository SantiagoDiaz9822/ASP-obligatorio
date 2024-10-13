const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos
const auth = require("../middleware/auth"); // Middleware de autenticación

// Rutas protegidas (usa el middleware)
router.use(auth);

// Ruta para obtener el reporte de uso
router.get("/report", (req, res) => {
  const { startDate, endDate } = req.query; // Obtener las fechas desde los parámetros de la consulta
  const userId = req.userId; // Obtener el ID del usuario
  // Verificar que se proporcionen las fechas
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Se requieren las fechas de inicio y fin." });
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

    res.json(results);
  });
});

module.exports = router;
