const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const companyController = require("../controllers/companyController");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3"); // Importar la configuración de S3
require("dotenv").config();

// Configurar multer para subir archivos a S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME, // Verifica que esta variable esté definida
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, `company-logos/${Date.now().toString()}_${file.originalname}`);
    },
  }),
});

// Crear una nueva empresa (solo administradores)
router.post(
  "/new",
  auth,
  authorize("admin"),
  upload.single("logo"), // Usamos 'logo' como el campo de archivo
  [
    body("name")
      .notEmpty()
      .withMessage("El nombre de la empresa es requerido."),
    body("address")
      .notEmpty()
      .withMessage("La dirección de la empresa es requerida."),
  ],
  companyController.createCompany
);

// Eliminar una empresa (solo administradores)
router.delete(
  "/:id",
  auth,
  authorize("admin"),
  companyController.deleteCompany
);

// Leer todas las empresas (solo administradores)
router.get("/", auth, authorize("admin"), companyController.getAllCompanies);

// Leer una empresa por ID (solo administradores)
router.get("/:id", auth, authorize("admin"), companyController.getCompanyById);

module.exports = router;
