const db = require("../config/db"); // Tu configuración de base de datos

// Función para registrar una acción de auditoría con promesas (usando async/await)
async function logAuditAction(action, entity, entityId, details, userId) {
  const timestamp = new Date().toISOString(); // Fecha y hora actual

  const auditRecord = {
    action,
    entity,
    entity_id: entityId,
    details: JSON.stringify(details),
    user_id: userId,
    timestamp,
  };

  const query =
    "INSERT INTO audit_log (action, entity, entity_id, details, user_id, timestamp) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [
    auditRecord.action,
    auditRecord.entity,
    auditRecord.entity_id,
    auditRecord.details,
    auditRecord.user_id,
    auditRecord.timestamp,
  ];

  try {
    const [result] = await db.promise().execute(query, values); // Usamos .promise() para promesas
    console.log("Acción de auditoría registrada con éxito", result);
  } catch (err) {
    console.error("Error al registrar la auditoría:", err);
  }
}

// Función para obtener los registros de auditoría con filtros usando async/await
async function getAuditLogs(filters) {
  let queryBase = "SELECT * FROM audit_log WHERE 1 = 1"; // Iniciar consulta con filtro de todas las entradas
  const queryValues = [];

  // Agregar filtros
  if (filters.startDate && filters.endDate) {
    queryBase += " AND timestamp BETWEEN ? AND ?";
    queryValues.push(filters.startDate, filters.endDate);
  }

  if (filters.action) {
    queryBase += " AND action = ?";
    queryValues.push(filters.action);
  }

  if (filters.userId) {
    queryBase += " AND user_id = ?";
    queryValues.push(filters.userId);
  }

  try {
    const [rows] = await db.promise().execute(queryBase, queryValues);
    return rows; // Retorna los registros obtenidos
  } catch (err) {
    console.error("Error al obtener los registros de auditoría:", err);
    throw new Error("Error al obtener los registros de auditoría");
  }
}

module.exports = { logAuditAction, getAuditLogs };
