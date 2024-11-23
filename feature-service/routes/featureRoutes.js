const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createFeature,
  getFeaturesByProjectId,
  getFeatureById,
  evaluateFeature,
} = require("../controllers/featureController");

// Crear una nueva feature (solo administradores)
router.post(
  "/new",
  auth,
  authorize("admin"),
  [
    body("project_id").notEmpty().withMessage("El project_id es requerido."),
    body("feature_key").notEmpty().withMessage("La feature_key es requerida."),
    body("description").notEmpty().withMessage("La descripción es requerida."),
    body("state")
      .isIn(["on", "off"])
      .withMessage('El estado debe ser "on" o "off".'),
    body("conditions")
      .optional()
      .isArray()
      .withMessage("Las condiciones deben ser un array."),
  ],
  createFeature
);

// Leer todas las features de un proyecto
router.get("/:id", auth, getFeaturesByProjectId);

// Leer una feature por ID
router.get("/feature/:id", auth, getFeatureById);

// Evaluar el estado de una feature
router.post("/evaluate", auth, evaluateFeature);

module.exports = router;
