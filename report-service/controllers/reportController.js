const connection = require("../config/db");

// Registrar un log de uso
const registerUsageLog = (req, res) => {
  const { feature_id, project_id, context, response } = req.body;

  // Validar datos entrantes
  if (!feature_id || !project_id || typeof response !== "boolean") {
    return res.status(400).json({ message: "Datos inválidos." });
  }

  const query = `
    INSERT INTO usage_logs (feature_id, project_id, context, response)
    VALUES (?, ?, ?, ?)
  `;
  connection.query(
    query,
    [feature_id, project_id, JSON.stringify(context), response],
    (err) => {
      if (err) {
        console.error("Error al registrar el log de uso:", err);
        return res
          .status(500)
          .json({ message: "Error al registrar el log de uso." });
      }
      res.status(201).json({ message: "Log de uso registrado exitosamente." });
    }
  );
};

// Obtener reporte de uso
const getUsageReport = (req, res) => {
  const { start_date, end_date, project_id, feature_id } = req.query;

  // Validar parámetros requeridos
  if (!start_date || !end_date) {
    return res.status(400).json({ message: "Rango de fechas requerido." });
  }

  // Construir la consulta SQL dinámica según los filtros
  let query = `
    SELECT 
      project_id, 
      feature_id, 
      COUNT(*) AS usage_count, 
      DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour
    FROM usage_logs
    WHERE created_at BETWEEN ? AND ?
  `;

  const queryParams = [start_date, end_date];

  // Agregar filtro por project_id si es necesario
  if (project_id) {
    query += ` AND project_id = ?`;
    queryParams.push(project_id);
  }

  // Agregar filtro por feature_id si es necesario
  if (feature_id) {
    query += ` AND feature_id = ?`;
    queryParams.push(feature_id);
  }

  // Finalizar la consulta con la agrupación y ordenación
  query += `
    GROUP BY project_id, feature_id, hour
    ORDER BY hour ASC;
  `;

  // Ejecutar la consulta
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error al obtener el reporte de uso:", err);
      return res.status(500).json({ message: "Error al obtener el reporte de uso." });
    }
    res.json({ data: results });
  });
};

module.exports = { registerUsageLog, getUsageReport };
