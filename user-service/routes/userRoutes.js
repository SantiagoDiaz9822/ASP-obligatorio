const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// Ruta para registrar un nuevo usuario (solo administradores)
router.post(
  "/register",
  auth,
  authorize("admin"),
  [
    body("email").isEmail().withMessage("El correo debe ser un email válido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("role")
      .isIn(["admin", "user"])
      .withMessage('El rol debe ser "admin" o "user".'),
  ],
  userController.registerUser
);

// Ruta para iniciar sesión
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("El correo debe ser un email válido"),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
  ],
  userController.loginUser
);

// Ruta para asignar un usuario a una empresa (solo administradores)
router.post(
  "/assign-to-company",
  auth,
  authorize("admin"),
  [
    body("user_id").notEmpty().withMessage("El user_id es requerido."),
    body("company_id").notEmpty().withMessage("El company_id es requerido."),
  ],
  userController.assignUserToCompany
);

// Ruta para obtener el company_id de un usuario
router.get("/:id/company", auth, userController.getCompanyIdForUser);

// Ruta para obtener todos los usuarios (solo administradores)
router.get("/", auth, authorize("admin"), userController.getAllUsers);

// Ruta para obtener un usuario por ID (solo administradores)
router.get("/:id", auth, authorize("admin"), userController.getUserById);

module.exports = router;
