const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
} = require("../controllers/companyController");

// Configurar Multer para subir archivos a S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key: (req, file, cb) => {
      cb(null, `logos/${Date.now().toString()}_${file.originalname}`);
    },
  }),
});

// Crear una nueva empresa (solo administradores)
router.post(
  "/new",
  auth,
  authorize("admin"),
  upload.single("logo"),
  [
    body("name").notEmpty().withMessage("El nombre es requerido."),
    body("address").notEmpty().withMessage("La dirección es requerida."),
  ],
  createCompany
);

// Leer todas las empresas (solo administradores)
router.get("/", auth, authorize("admin"), getAllCompanies);

// Leer una empresa por ID
router.get("/:id", auth, authorize("admin"), getCompanyById);

module.exports = router;
