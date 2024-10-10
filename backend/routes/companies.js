const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos
const auth = require("../middleware/auth"); // Middleware de autenticación
const authorize = require("../middleware/authorize"); // Middleware de autorización
const { body, validationResult } = require("express-validator"); // Para validaciones
const bcrypt = require("bcrypt"); // Para hashear contraseñas

// Ruta para registrar una nueva empresa (solo administradores)
router.post(
  "/new",
  auth,
  authorize("admin"),
  [
    body("name")
      .notEmpty()
      .withMessage("El nombre de la empresa es requerido."),
    body("address").notEmpty().withMessage("La dirección es requerida."),
    body("logo_url").notEmpty().withMessage("La URL del logo es requerida."),
    body("users")
      .optional()
      .isArray()
      .withMessage("Los usuarios deben ser un array."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, logo_url, users } = req.body;

    const query =
      "INSERT INTO companies (name, address, logo_url) VALUES (?, ?, ?)";
    connection.query(query, [name, address, logo_url], (err, results) => {
      if (err) {
        console.error("Error al crear la empresa:", err);
        return res.status(500).json({ message: "Error al crear la empresa." });
      }

      const companyId = results.insertId;

      // Crear usuarios asociados si se proporcionan
      if (users && users.length > 0) {
        users.forEach((user) => {
          const { email, password, role } = user;
          // Hashear la contraseña
          const hashedPassword = bcrypt.hashSync(password, 10);
          const userQuery =
            "INSERT INTO users (company_id, email, password_hash, role) VALUES (?, ?, ?, ?)";

          connection.query(
            userQuery,
            [companyId, email, hashedPassword, role],
            (err) => {
              if (err) {
                console.error("Error al crear el usuario:", err);
              }
            }
          );
        });
      }

      res
        .status(201)
        .json({ message: "Empresa creada exitosamente", companyId });
    });
  }
);

// Leer todas las empresas (protegida, solo administradores)
router.get("/", auth, authorize("admin"), (req, res) => {
  const query = "SELECT * FROM companies";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener las empresas:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener las empresas." });
    }
    res.json(results);
  });
});

// Leer una empresa por ID (protegida, solo administradores)
router.get("/:id", auth, authorize("admin"), (req, res) => {
  const companyId = req.params.id;

  const query = "SELECT * FROM companies WHERE id = ?";
  connection.query(query, [companyId], (err, results) => {
    if (err) {
      console.error("Error al obtener la empresa:", err);
      return res.status(500).json({ message: "Error al obtener la empresa." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada." });
    }
    res.json(results[0]);
  });
});

// Actualizar una empresa (protegida, solo administradores)
router.put(
  "/:id",
  auth,
  authorize("admin"),
  [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("El nombre de la empresa no puede estar vacío."),
    body("address")
      .optional()
      .notEmpty()
      .withMessage("La dirección no puede estar vacía."),
    body("logo_url")
      .optional()
      .notEmpty()
      .withMessage("La URL del logo no puede estar vacía."),
  ],
  (req, res) => {
    const companyId = req.params.id;
    const { name, address, logo_url } = req.body;

    const query =
      "UPDATE companies SET name = ?, address = ?, logo_url = ? WHERE id = ?";
    connection.query(
      query,
      [name, address, logo_url, companyId],
      (err, results) => {
        if (err) {
          console.error("Error al actualizar la empresa:", err);
          return res
            .status(500)
            .json({ message: "Error al actualizar la empresa." });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Empresa no encontrada." });
        }
        res.json({ message: "Empresa actualizada exitosamente" });
      }
    );
  }
);

// Eliminar una empresa (protegida, solo administradores)
router.delete("/:id", auth, authorize("admin"), (req, res) => {
  const companyId = req.params.id;

  const query = "DELETE FROM companies WHERE id = ?";
  connection.query(query, [companyId], (err, results) => {
    if (err) {
      console.error("Error al eliminar la empresa:", err);
      return res.status(500).json({ message: "Error al eliminar la empresa." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Empresa no encontrada." });
    }
    res.json({ message: "Empresa eliminada exitosamente" });
  });
});

module.exports = router;
