const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const connection = require("../db");
const transporter = require("../mailer");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// Ruta para registrar un usuario (protegido, solo administradores)
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: "user"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
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

      const query =
        "INSERT INTO users (email, password_hash, role, first_login) VALUES (?, ?, ?, false)";
      connection.query(query, [email, hashedPassword, role], (err, results) => {
        if (err) {
          console.error("Error al crear el usuario:", err);
          return res
            .status(500)
            .json({ message: "Error al crear el usuario." });
        }

        const token = jwt.sign(
          { email },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

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

// Ruta para asignar un usuario a una empresa
/**
 * @swagger
 * /users/assign-to-company:
 *   post:
 *     summary: Asignar un usuario a una empresa
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "123"
 *               company_id:
 *                 type: string
 *                 example: "456"
 *     responses:
 *       200:
 *         description: Usuario asignado a la empresa exitosamente
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
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
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales incorrectas
 */
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

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: "Credenciales incorrectas." });
      }

      if (!user.first_login) {
        return res.status(403).json({
          message: "Debes restablecer tu contraseña antes de iniciar sesión.",
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, company_id: user.company_id },
        process.env.JWT_SECRET,
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
/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Restablecer la contraseña
 *     description: Restablece la contraseña de un usuario utilizando un token de verificación.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de verificación para restablecer la contraseña.
 *               new_password:
 *                 type: string
 *                 description: Nueva contraseña del usuario.
 *             required:
 *               - token
 *               - new_password
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente.
 *       400:
 *         description: Error de validación de los datos proporcionados.
 *       401:
 *         description: Token inválido o expirado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al actualizar la contraseña.
 */
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

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token inválido o expirado." });
      }

      const { email } = decoded;

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
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Devuelve una lista de todos los usuarios (solo accesible por administradores).
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios.
 *       401:
 *         description: Acceso no autorizado.
 *       500:
 *         description: Error al obtener los usuarios.
 */
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
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Devuelve los detalles de un usuario específico por su ID (solo accesible por administradores).
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a obtener.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *       401:
 *         description: Acceso no autorizado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al obtener el usuario.
 */
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
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     description: Actualiza la información de un usuario específico (solo accesible por administradores).
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a actualizar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Nuevo correo electrónico del usuario.
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 description: Nuevo rol del usuario.
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente.
 *       400:
 *         description: Error de validación de los datos proporcionados.
 *       401:
 *         description: Acceso no autorizado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al actualizar el usuario.
 */
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
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     description: Elimina un usuario específico por su ID (solo accesible por administradores).
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
 *       401:
 *         description: Acceso no autorizado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al eliminar el usuario.
 */
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
