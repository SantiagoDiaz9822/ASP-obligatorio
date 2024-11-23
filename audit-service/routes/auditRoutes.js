const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createAuditRecord,
  getAllAuditLogs,
  getAuditLogById,
} = require("../controllers/auditController");

// Registrar una nueva acción de auditoría (solo administradores)
router.post(
  "/new",
  auth,
  authorize("admin"),
  [
    body("action").notEmpty().withMessage("La acción es requerida."),
    body("details").isObject().withMessage("Los detalles deben ser un objeto."),
  ],
  createAuditRecord
);

// Leer todos los registros de auditoría (solo administradores)
router.get("/", auth, authorize("admin"), getAllAuditLogs);

// Leer un registro de auditoría por ID (solo administradores)
router.get("/:id", auth, authorize("admin"), getAuditLogById);

module.exports = router;
