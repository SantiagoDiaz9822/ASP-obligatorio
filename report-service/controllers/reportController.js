const connection = require("../config/db");
const { validationResult } = require("express-validator");

// Obtener el reporte de uso por fechas y criterios de filtrado
const getUsageReport = (req, res) => {
  const { startDate, endDate, projectId, featureKey } = req.query;

  // Validación de los datos
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Se requieren las fechas de inicio y fin." });
  }

  let query = `
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
  `;

  const params = [startDate, endDate];

  if (projectId) {
    query += " AND p.id = ?";
    params.push(projectId);
  }

  if (featureKey) {
    query += " AND f.feature_key = ?";
    params.push(featureKey);
  }

  query += " GROUP BY p.name, f.feature_key ORDER BY p.name, f.feature_key";

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Error al obtener el reporte de uso:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener el reporte de uso." });
    }

    res.json(results);
  });
};

module.exports = { getUsageReport };
