const nodemailer = require("nodemailer");
require("dotenv").config(); // Cargar variables de entorno

// Configuración del transporte
const transporter = nodemailer.createTransport({
  service: "gmail", // Puedes usar otros servicios como SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER, // Tu correo electrónico
    pass: process.env.EMAIL_PASS, // Tu contraseña de correo
  },
});

module.exports = transporter;
