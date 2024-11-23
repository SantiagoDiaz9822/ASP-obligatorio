const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const featureController = require("../controllers/featureController");
const axios = require("axios");

// Crear una nueva feature (solo administradores)
router.post(
  "/new",
  auth,
  authorize("admin"),
  [
    body("project_id")
      .notEmpty()
      .withMessage("El project_id es requerido.")
      .custom(async (value) => {
        try {
          const response = await axios.get(
            `${process.env.PROJECT_SERVICE_URL}/api/projects/${value}`
          );
          if (response.status !== 200) {
            throw new Error("Proyecto no encontrado.");
          }
        } catch (err) {
          throw new Error("El proyecto con el ID proporcionado no existe.");
        }
      }),
    body("feature_key")
      .notEmpty()
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "La key debe ser alfanumérica y no puede contener espacios."
      ),
    body("description").notEmpty().withMessage("La descripción es requerida."),
    body("state")
      .isIn(["on", "off"])
      .withMessage('El estado debe ser "on" o "off".'),
    body("conditions")
      .optional()
      .isArray()
      .withMessage("Las condiciones deben ser un array."),
  ],
  featureController.createFeature
);

// Modificar una feature (solo administradores)
router.put(
  "/:id",
  auth,
  authorize("admin"),
  [
    body("description")
      .optional()
      .notEmpty()
      .withMessage("La descripción no puede estar vacía."),
    body("state")
      .optional()
      .isIn(["on", "off"])
      .withMessage('El estado debe ser "on" o "off".'),
    body("conditions")
      .optional()
      .isArray()
      .withMessage("Las condiciones deben ser un array."),
  ],
  featureController.updateFeature
);

// Eliminar una feature (solo administradores)
router.delete(
  "/:id",
  auth,
  authorize("admin"),
  featureController.deleteFeature
);

// Leer todas las features de un proyecto
router.get("/projects/:id", auth, featureController.getFeaturesByProjectId);

// Leer una feature por ID
router.get("/:id", auth, featureController.getFeatureById);

// Evaluar el estado de una feature
router.post(
  "/evaluate",
  [
    body("feature_key").notEmpty().withMessage("El feature_key es requerido."),
    body("context")
      .isObject()
      .withMessage("El contexto debe ser un objeto válido."),
  ],
  featureController.evaluateFeature
);

module.exports = router;
