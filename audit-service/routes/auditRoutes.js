const express = require("express");
const {
  logAuditAction,
  getAuditLogs,
} = require("../controllers/auditController");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// Ruta para registrar una acción de auditoría
router.post("/log", async (req, res) => {
  const { action, entity, entityId, details, userId } = req.body;

  if (!action || !entity || !entityId || !details || !userId) {
    return res.status(400).json({ error: "Faltan parámetros requeridos" });
  }

  try {
    await logAuditAction(action, entity, entityId, details, userId);
    return res
      .status(200)
      .json({ message: "Acción de auditoría registrada con éxito" });
  } catch (err) {
    console.error("Error al registrar la acción de auditoría:", err);
    return res
      .status(500)
      .json({ error: "Error al registrar la acción de auditoría" });
  }
});

// Ruta para obtener registros de auditoría filtrados
router.get("/logs", auth, authorize("admin"), async (req, res) => {
  const filters = {};

  // Recoger filtros opcionales de la query string
  if (req.query.startDate && req.query.endDate) {
    filters.startDate = req.query.startDate;
    filters.endDate = req.query.endDate;
  }

  if (req.query.action) {
    filters.action = req.query.action;
  }

  if (req.query.userId) {
    filters.userId = req.query.userId;
  }

  try {
    const logs = await getAuditLogs(filters);
    return res.status(200).json({ logs });
  } catch (err) {
    console.error("Error al obtener los logs de auditoría:", err);
    return res
      .status(500)
      .json({ error: "Error al obtener los registros de auditoría" });
  }
});

module.exports = router;
