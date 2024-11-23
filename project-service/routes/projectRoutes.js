const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const projectController = require("../controllers/projectController");

// Crear un nuevo proyecto (solo administradores)
router.post(
  "/new",
  auth,
  authorize("admin"),
  [
    body("name").notEmpty().withMessage("El nombre del proyecto es requerido."),
    body("description")
      .notEmpty()
      .withMessage("La descripción del proyecto es requerida."),
  ],
  projectController.createProject
);

// Leer todos los proyectos de la empresa
router.get("/", auth, projectController.getAllProjects);

// Leer un proyecto por ID
router.get("/:id", auth, projectController.getProjectById);

// Eliminar un proyecto (solo administradores)
router.delete(
  "/:id",
  auth,
  authorize("admin"),
  projectController.deleteProject
);

// Validar API Key
router.get("/projects/validate", projectController.validateApiKey);

module.exports = router;
