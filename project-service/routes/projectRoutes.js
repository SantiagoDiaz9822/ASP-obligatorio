const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createProject,
  getAllProjects,
  getProjectById,
} = require("../controllers/projectController");

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
  createProject
);

// Leer todos los proyectos de la empresa
router.get("/", auth, getAllProjects);

// Leer un proyecto por ID
router.get("/:id", auth, getProjectById);

module.exports = router;
