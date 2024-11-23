const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../config/db");
const transporter = require("../services/mailer");
const axios = require("axios"); // Asegúrate de tener axios instalado

const registerUser = async (req, res) => {
  const { email, password, role } = req.body;
  const userId = req.userId;

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

      // Registrar la creación del usuario en el servicio de auditoría
      axios
        .post(`${process.env.AUDIT_SERVICE_URL}/api/audit/log`, {
          action: "create",
          entity: "user",
          entityId: results.insertId,
          details: { email, role },
          userId: userId, // Agregar el ID del usuario que realizó la acción
        })
        .then(() => {
          console.log("Auditoría registrada para la creación del usuario.");
        })
        .catch((err) => {
          console.error("Error al registrar la auditoría:", err);
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

      res.status(201).json({
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

// Asignar usuario a una empresa
const assignUserToCompany = (req, res) => {
  const { user_id, company_id } = req.body;

  // Validaciones
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Verificar si la empresa existe llamando al microservicio de empresas
  axios
    .get(`${process.env.COMPANY_SERVICE_URL}/companies/${company_id}`)
    .then((response) => {
      // Si la empresa existe, proseguimos con la asignación del usuario
      const checkUserQuery = "SELECT * FROM users WHERE id = ?";
      connection.query(checkUserQuery, [user_id], (err, userResults) => {
        if (err) {
          console.error("Error al verificar el usuario:", err);
          return res
            .status(500)
            .json({ message: "Error al verificar el usuario." });
        }

        if (userResults.length === 0) {
          return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Asignar al usuario a la empresa
        const updateUserQuery = "UPDATE users SET company_id = ? WHERE id = ?";
        connection.query(
          updateUserQuery,
          [company_id, user_id],
          (err, results) => {
            if (err) {
              console.error("Error al asignar el usuario a la empresa:", err);
              return res
                .status(500)
                .json({ message: "Error al asignar el usuario a la empresa." });
            }

            // Registrar la acción de la asignación en el microservicio de auditoría
            logUserAssignmentToAuditService(user_id, company_id);

            res.status(200).json({
              message: "Usuario asignado a la empresa exitosamente.",
            });
          }
        );
      });
    })
    .catch((error) => {
      console.error("Error al verificar la empresa:", error);
      return res.status(404).json({ message: "Empresa no encontrada." });
    });
};

// Ruta para obtener el company_id de un usuario
const getCompanyIdForUser = (req, res) => {
  const userId = req.params.id; // ID del usuario

  const query = "SELECT company_id FROM users WHERE id = ?";
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener el company_id del usuario:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener el company_id." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json({ company_id: results[0].company_id });
  });
};

// Obtener todos los usuarios
const getAllUsers = (req, res) => {
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
};

// Obtener un usuario por ID
const getUserById = (req, res) => {
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
};

module.exports = {
  registerUser,
  loginUser,
  assignUserToCompany,
  getCompanyIdForUser,
  getAllUsers,
  getUserById,
};
