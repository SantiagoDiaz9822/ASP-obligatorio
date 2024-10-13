const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Para hashear las contraseñas
const jwt = require("jsonwebtoken"); // Para manejar JWT
const { body, validationResult } = require("express-validator"); // Para validación
const connection = require("../db"); // Conexión a la base de datos
const transporter = require("../mailer"); // Importa el transportador
require("dotenv").config(); // Cargar variables de entorno

const JWT_SECRET = process.env.JWT_SECRET; // Cargar el secreto desde .env
const auth = require("../middleware/auth"); // Middleware de autenticación
const authorize = require("../middleware/authorize"); // Middleware de autorización

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inicializar first_login en false
      const query =
        "INSERT INTO users (email, password_hash, role, first_login) VALUES (?, ?, ?, false)";
      connection.query(query, [email, hashedPassword, role], (err, results) => {
        if (err) {
          console.error("Error al crear el usuario:", err);
          return res
            .status(500)
            .json({ message: "Error al crear el usuario." });
        }

        // Generar un token para el primer inicio de sesión
        const token = jwt.sign(
          { email }, // Solo pasamos el email
          process.env.JWT_SECRET,
          {
            expiresIn: "1h", // El token expirará en 1 hora
          }
        );

        // Enviar correo electrónico de bienvenida
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Bienvenido a Nuestra Aplicación",
          text: `Hola,\n\nGracias por registrarte en nuestra aplicación. 
          Puedes realizar tu primer inicio de sesión usando el siguiente enlace:\n
          ${process.env.FRONTEND_URL}/reset-password?token=${token}\n\n¡Bienvenido a bordo!`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error al enviar el correo:", error);
          } else {
            console.log("Correo enviado:", info.response);
          }
        });

        res.status(201).json({
          message: "Usuario creado exitosamente",
          userId: results.insertId,
        });
      });
    } catch (error) {
      console.error("Error al hashear la contraseña:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }
);

// Nueva ruta para asignar un usuario a una empresa
router.post(
  "/assign-to-company",
  auth,
  authorize("admin"),
  [
    body("user_id").notEmpty().withMessage("El user_id es requerido."),
    body("company_id").notEmpty().withMessage("El company_id es requerido."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, company_id } = req.body;

    const query = "UPDATE users SET company_id = ? WHERE id = ?";
    connection.query(query, [company_id, user_id], (err, results) => {
      if (err) {
        console.error("Error al asignar el usuario:", err);
        return res
          .status(500)
          .json({ message: "Error al asignar el usuario." });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      res.json({ message: "Usuario asignado a la empresa exitosamente." });
    });
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

      // Verificar si el usuario ha restablecido su contraseña
      if (!user.first_login) {
        // Cambiado de `if (user.first_login)`
        return res.status(403).json({
          message: "Debes restablecer tu contraseña antes de iniciar sesión.",
        });
      }

      // Generar un token JWT
      const token = jwt.sign(
        { id: user.id, role: user.role, company_id: user.company_id },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      const role = user.role;
      const company_id = user.company_id;
      res.json({
        message: "Inicio de sesión exitoso",
        token,
        role,
        company_id,
      });
    });
  }
);

// Ruta para restablecer la contraseña usando el token
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("El token es requerido."),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, new_password } = req.body;

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token inválido o expirado." });
      }

      // Extraer información del token
      const { email } = decoded;

      // Actualizar la contraseña y marcar que el usuario ya realizó el primer login
      const hashedPassword = await bcrypt.hash(new_password, 10);
      const updateQuery =
        "UPDATE users SET password_hash = ?, first_login = true WHERE email = ?";

      connection.query(updateQuery, [hashedPassword, email], (err, results) => {
        if (err) {
          console.error("Error al actualizar la contraseña:", err);
          return res
            .status(500)
            .json({ message: "Error al actualizar la contraseña." });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.json({
          message:
            "Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.",
        });
      });
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
router.put(
  "/:id",
  auth,
  authorize("admin"),
  [
    body("email")
      .optional()
      .isEmail()
      .withMessage("El correo debe ser un email válido"),
    body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage('El rol debe ser "admin" o "user".'),
  ],
  (req, res) => {
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
  }
);

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
