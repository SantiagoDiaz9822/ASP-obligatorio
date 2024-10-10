const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos
const auth = require("../middleware/auth"); // Importa el middleware

// Rutas protegidas (usa el middleware)
router.use(auth);

// Crear un nuevo registro de cambio
router.post("/new", (req, res) => {
  const { feature_id, user_id, action, changed_fields } = req.body;

  if (!feature_id || !action) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  const query =
    "INSERT INTO change_history (feature_id, user_id, action, changed_fields) VALUES (?, ?, ?, ?)";
  connection.query(
    query,
    [feature_id, user_id, action, JSON.stringify(changed_fields)],
    (err, results) => {
      if (err) {
        console.error("Error al crear el registro de cambio:", err);
        return res
          .status(500)
          .json({ message: "Error al crear el registro de cambio." });
      }
      res.status(201).json({
        message: "Registro de cambio creado exitosamente",
        changeId: results.insertId,
      });
    }
  );
});

// Leer todos los registros de cambios
router.get("/", (req, res) => {
  const query = "SELECT * FROM change_history";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los registros de cambios:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los registros de cambios." });
    }
    res.json(results);
  });
});

// Leer un registro de cambio por ID
router.get("/:id", (req, res) => {
  const changeId = req.params.id;

  const query = "SELECT * FROM change_history WHERE id = ?";
  connection.query(query, [changeId], (err, results) => {
    if (err) {
      console.error("Error al obtener el registro de cambio:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener el registro de cambio." });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Registro de cambio no encontrado." });
    }
    res.json(results[0]);
  });
});

// Actualizar un registro de cambio
router.put("/:id", (req, res) => {
  const changeId = req.params.id;
  const { feature_id, user_id, action, changed_fields } = req.body;

  const query =
    "UPDATE change_history SET feature_id = ?, user_id = ?, action = ?, changed_fields = ? WHERE id = ?";
  connection.query(
    query,
    [feature_id, user_id, action, JSON.stringify(changed_fields), changeId],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar el registro de cambio:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar el registro de cambio." });
      }
      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Registro de cambio no encontrado." });
      }
      res.json({ message: "Registro de cambio actualizado exitosamente" });
    }
  );
});

// Eliminar un registro de cambio
router.delete("/:id", (req, res) => {
  const changeId = req.params.id;

  const query = "DELETE FROM change_history WHERE id = ?";
  connection.query(query, [changeId], (err, results) => {
    if (err) {
      console.error("Error al eliminar el registro de cambio:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar el registro de cambio." });
    }
    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Registro de cambio no encontrado." });
    }
    res.json({ message: "Registro de cambio eliminado exitosamente" });
  });
});

module.exports = router;
