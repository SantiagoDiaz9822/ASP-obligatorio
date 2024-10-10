const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Para hashear las contraseñas
const jwt = require("jsonwebtoken"); // Para manejar JWT
const { body, validationResult } = require("express-validator"); // Para validación
const connection = require("../db"); // Conexión a la base de datos
require("dotenv").config(); // Cargar variables de entorno

const JWT_SECRET = process.env.JWT_SECRET; // Cargar el secreto desde .env
const auth = require("../middleware/auth"); // Middleware de autenticación
const authorize = require("../middleware/authorize"); // Middleware de autorización

// Ruta para registrar un nuevo usuario (solo administradores)
router.post(
  "/register",
  auth,
  authorize("admin"),
  [
    body("company_id")
      .notEmpty()
      .withMessage("El campo company_id es requerido."),
    body("email").isEmail().withMessage("El correo debe ser un email válido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("role")
      .isIn(["admin", "user"])
      .withMessage('El rol debe ser "admin" o "user".'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { company_id, email, password, role } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const query =
        "INSERT INTO users (company_id, email, password_hash, role, first_login) VALUES (?, ?, ?, ?, true)";
      connection.query(
        query,
        [company_id, email, hashedPassword, role],
        (err, results) => {
          if (err) {
            console.error("Error al crear el usuario:", err);
            return res
              .status(500)
              .json({ message: "Error al crear el usuario." });
          }
          res
            .status(201)
            .json({
              message: "Usuario creado exitosamente",
              userId: results.insertId,
            });
        }
      );
    } catch (error) {
      console.error("Error al hashear la contraseña:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }
);

// Ruta para iniciar sesión
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("El correo debe ser un email válido"),
    body("password").notEmpty().withMessage("La contraseña es requerida."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    connection.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Error al buscar el usuario:", err);
        return res.status(500).json({ message: "Error al buscar el usuario." });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Credenciales incorrectas." });
      }

      const user = results[0];

      // Verificar la contraseña
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: "Credenciales incorrectas." });
      }

      // Generar un token JWT
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ message: "Inicio de sesión exitoso", token });
    });
  }
);

// Ruta para obtener todos los usuarios (protegida, solo administradores)
router.get("/", auth, authorize("admin"), (req, res) => {
  const query = "SELECT * FROM users";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los usuarios:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los usuarios." });
    }
    res.json(results);
  });
});

// Ruta para obtener un usuario por ID (protegida, solo administradores)
router.get("/:id", auth, authorize("admin"), (req, res) => {
  const userId = req.params.id;

  const query = "SELECT * FROM users WHERE id = ?";
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener el usuario:", err);
      return res.status(500).json({ message: "Error al obtener el usuario." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.json(results[0]);
  });
});

// Ruta para actualizar un usuario (protegida, solo administradores)
router.put("/:id", auth, authorize("admin"), (req, res) => {
  const userId = req.params.id;
  const { email, role } = req.body;

  const query = "UPDATE users SET email = ?, role = ? WHERE id = ?";
  connection.query(query, [email, role, userId], (err, results) => {
    if (err) {
      console.error("Error al actualizar el usuario:", err);
      return res
        .status(500)
        .json({ message: "Error al actualizar el usuario." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.json({ message: "Usuario actualizado exitosamente" });
  });
});

// Ruta para eliminar un usuario (protegida, solo administradores)
router.delete("/:id", auth, authorize("admin"), (req, res) => {
  const userId = req.params.id;

  const query = "DELETE FROM users WHERE id = ?";
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error al eliminar el usuario:", err);
      return res.status(500).json({ message: "Error al eliminar el usuario." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.json({ message: "Usuario eliminado exitosamente" });
  });
});

module.exports = router;
