const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.post("/register", registerUser); // Registrarse
router.post("/login", loginUser); // Iniciar sesión

module.exports = router;
