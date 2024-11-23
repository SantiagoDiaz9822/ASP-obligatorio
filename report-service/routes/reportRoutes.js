const express = require("express");
const router = express.Router();
const {
  registerUsageLog,
  getUsageReport,
} = require("../controllers/reportController");

// Endpoint para registrar un log de uso
router.post("/log", registerUsageLog);

// Endpoint para obtener reporte de uso
router.get("/report", getUsageReport);

module.exports = router;
