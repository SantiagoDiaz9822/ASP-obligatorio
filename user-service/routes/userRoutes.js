const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../config/db");
const transporter = require("../services/mailer");

const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (email, password_hash, role, first_login) VALUES (?, ?, ?, false)";

    connection.query(query, [email, hashedPassword, role], (err, results) => {
      if (err) {
        console.error("Error al registrar el usuario:", err);
        return res
          .status(500)
          .json({ message: "Error al registrar el usuario." });
      }

      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Enviar email de bienvenida
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Bienvenido a la aplicación",
        text: `Hola, gracias por registrarte. Usa este enlace para configurar tu contraseña: ${process.env.FRONTEND_URL}/reset-password?token=${token}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar el correo:", error);
        } else {
          console.log("Correo enviado:", info.response);
        }
      });

      res
        .status(201)
        .json({
          message: "Usuario creado exitosamente",
          userId: results.insertId,
        });
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error al buscar el usuario:", err);
      return res.status(500).json({ message: "Error al buscar el usuario." });
    }

    if (
      results.length === 0 ||
      !(await bcrypt.compare(password, results[0].password_hash))
    ) {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    const user = results[0];
    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Inicio de sesión exitoso", token });
  });
};

module.exports = { registerUser, loginUser };
