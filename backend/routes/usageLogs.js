// Ruta para obtener el reporte de uso (solo administradores)
router.get("/report", authorize("admin"), (req, res) => {
  const { startDate, endDate, project_id } = req.query;

  // Validar parámetros
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate y endDate son requeridos." });
  }

  // Consultar registros de uso filtrando por fecha y opcionalmente por proyecto
  let query = `
    SELECT feature_id, COUNT(*) AS usage_count
    FROM usage_logs
    WHERE created_at BETWEEN ? AND ?
  `;
  const params = [startDate, endDate];

  if (project_id) {
    query += " AND project_id = ?";
    params.push(project_id);
  }

  query += " GROUP BY feature_id";

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Error al obtener el reporte de uso:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener el reporte de uso." });
    }
    res.json(results);
  });
});
