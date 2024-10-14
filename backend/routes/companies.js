const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const connection = require("../db");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const transporter = require("../mailer");

// Configura AWS S3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN, 
  region: process.env.AWS_REGION,
});

// Configurar multer para subir a S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `logos/${Date.now().toString()}_${file.originalname}`);
    },
  }),
});

// Ruta para registrar una nueva empresa (solo administradores)
/**
 * @swagger
 * /companies/new:
 *   post:
 *     summary: Crear una nueva empresa
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Empresa creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 companyId:
 *                   type: integer
 *                 logoUrl:
 *                   type: string
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error al crear la empresa
 */
router.post(
  "/new",
  auth,
  authorize("admin"),
  upload.single("logo"),
  [
    body("name")
      .notEmpty()
      .withMessage("El nombre de la empresa es requerido."),
    body("address").notEmpty().withMessage("La dirección es requerida."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address } = req.body;
    const logoUrl = req.file.location;

    const query =
      "INSERT INTO companies (name, address, logo_url) VALUES (?, ?, ?)";
    connection.query(query, [name, address, logoUrl], (err, results) => {
      if (err) {
        console.error("Error al crear la empresa:", err);
        return res.status(500).json({ message: "Error al crear la empresa." });
      }
      const companyId = results.insertId;

      res
        .status(201)
        .json({ message: "Empresa creada exitosamente", companyId, logoUrl });
    });
  }
);

// Ruta para crear usuarios asociados a una empresa existente (solo administradores)
/**
 * @swagger
 * /companies/{id}/users:
 *   post:
 *     summary: Crear un nuevo usuario asociado a una empresa
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la empresa
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: integer
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error al crear el usuario
 */
router.post(
  "/:id/users",
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

    const companyId = req.params.id;
    const { email, password, role } = req.body;

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const userQuery =
      "INSERT INTO users (company_id, email, password_hash, role, first_login) VALUES (?, ?, ?, ?, false)";

    connection.query(
      userQuery,
      [companyId, email, hashedPassword, role],
      (err, results) => {
        if (err) {
          console.error("Error al crear el usuario:", err);
          return res
            .status(500)
            .json({ message: "Error al crear el usuario." });
        }

        // Enviar correo electrónico de bienvenida
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Bienvenido a Nuestra Aplicación",
          text: `Hola,\n\nGracias por registrarte en nuestra aplicación. 
          Puedes realizar tu primer inicio de sesión usando el siguiente enlace:\n
          ${process.env.FRONTEND_URL}/reset-password?email=${email}\n\n¡Bienvenido a bordo!`,
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
      }
    );
  }
);

// Leer todas las empresas (protegida, solo administradores)
/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Obtener todas las empresas
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   logo_url:
 *                     type: string
 *       500:
 *         description: Error al obtener las empresas
 */
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
/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Obtener una empresa por ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la empresa
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 logo_url:
 *                   type: string
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error al obtener la empresa
 */
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

// Ruta para actualizar una empresa (protegida, solo administradores)
/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Actualiza una empresa
 *     tags: [Companies]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la empresa a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre de la empresa
 *               address:
 *                 type: string
 *                 description: Nueva dirección de la empresa
 *               logo_url:
 *                 type: string
 *                 description: Nueva URL del logo de la empresa
 *     responses:
 *       200:
 *         description: Empresa actualizada exitosamente
 *       400:
 *         description: Errores de validación
 *       403:
 *         description: Acceso denegado (solo administradores)
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error al actualizar la empresa
 */
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

// Eliminar una empresa (solo administradores)
/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Eliminar una empresa por ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la empresa
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empresa eliminada exitosamente
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error al eliminar la empresa
 */
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
    res.json({ message: "Empresa eliminada exitosamente." });
  });
});

module.exports = router;
