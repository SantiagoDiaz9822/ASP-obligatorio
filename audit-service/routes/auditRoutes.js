const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const {
  createAuditRecord,
  getAllAuditLogs,
  getAuditLogById,
} = require("../controllers/auditController");

// Registrar una nueva acción de auditoría
router.post(
  "/log",
  auth,
  [
    body("action").notEmpty().withMessage("La acción es requerida."),
    body("entity").notEmpty().withMessage("La entidad es requerida."),
    body("entityId")
      .notEmpty()
      .withMessage("El ID de la entidad es requerido."),
    body("details").isObject().withMessage("Los detalles deben ser un objeto."),
    body("userId").notEmpty().withMessage("El ID del usuario es requerido."),
  ],
  createAuditRecord
);

// Leer todos los registros de auditoría
router.get("/", auth, getAllAuditLogs);

// Leer un registro de auditoría por ID
router.get("/:id", auth, getAuditLogById);

module.exports = router;
