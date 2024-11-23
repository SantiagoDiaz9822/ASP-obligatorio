const connection = require("../config/db");
const { validationResult } = require("express-validator");

// Registrar una nueva acción en el historial de auditoría
const createAuditRecord = (req, res) => {
  const { action, details } = req.body;
  const userId = req.userId;

  // Validación de los datos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const query =
    "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)";
  connection.query(
    query,
    [userId, action, JSON.stringify(details)],
    (err, results) => {
      if (err) {
        console.error("Error al registrar la acción de auditoría:", err);
        return res
          .status(500)
          .json({ message: "Error al registrar la acción." });
      }

      res.status(201).json({
        message: "Acción registrada exitosamente en el historial de auditoría.",
        auditId: results.insertId,
      });
    }
  );
};

// Leer todos los registros de auditoría
const getAllAuditLogs = (req, res) => {
  const query = "SELECT * FROM audit_logs";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los registros de auditoría:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los registros." });
    }

    res.json(results);
  });
};

// Leer un registro de auditoría por ID
const getAuditLogById = (req, res) => {
  const auditId = req.params.id;

  const query = "SELECT * FROM audit_logs WHERE id = ?";
  connection.query(query, [auditId], (err, results) => {
    if (err) {
      console.error("Error al obtener el registro de auditoría:", err);
      return res.status(500).json({ message: "Error al obtener el registro." });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Registro de auditoría no encontrado." });
    }
    res.json(results[0]);
  });
};

module.exports = { createAuditRecord, getAllAuditLogs, getAuditLogById };
