const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Usamos bcrypt para hashear las contraseñas
const connection = require("../db"); // Conexión a la base de datos

// Crear un nuevo usuario
router.post("/new", async (req, res) => {
  const { company_id, email, password, role } = req.body;

  if (!company_id || !email || !password || !role) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario en la base de datos
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
        res.status(201).json({
          message: "Usuario creado exitosamente",
          userId: results.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Error al hashear la contraseña:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Leer todos los usuarios
router.get("/", (req, res) => {
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

// Leer un usuario por ID
router.get("/:id", (req, res) => {
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

// Actualizar un usuario
router.put("/:id", (req, res) => {
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

// Eliminar un usuario
router.delete("/:id", (req, res) => {
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
