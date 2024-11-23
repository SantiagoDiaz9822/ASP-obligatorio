const express = require("express");
const router = express.Router();
const { query } = require("express-validator");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { getUsageReport } = require("../controllers/reportController");

// Obtener el reporte de uso (solo administradores)
router.get(
  "/report",
  auth,
  authorize("admin"),
  [
    query("startDate")
      .isString()
      .withMessage("La fecha de inicio es requerida."),
    query("endDate").isString().withMessage("La fecha de fin es requerida."),
  ],
  getUsageReport
);

module.exports = router;
