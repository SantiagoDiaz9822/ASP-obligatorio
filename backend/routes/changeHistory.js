const express = require("express");
const router = express.Router();
const connection = require("../db"); 
const auth = require("../middleware/auth"); 

// Rutas protegidas (usa el middleware)
router.use(auth);

// Ruta para registrar un nuevo cambio
router.post("/new", (req, res) => {
  const { feature_id, action, changed_fields } = req.body;
  const user_id = req.userId; // Obtiene el ID del usuario de la solicitud

  // Validar los campos requeridos
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
        console.error("Error al registrar el cambio:", err);
        return res
          .status(500)
          .json({ message: "Error al registrar el cambio." });
      }
      res.status(201).json({
        message: "Registro de cambio creado exitosamente",
        changeId: results.insertId,
      });
    }
  );
});

// Leer todos los registros de cambios con filtros
router.get("/", (req, res) => {
  const { startDate, endDate, feature_key, user_id } = req.query;

  let query = "SELECT * FROM change_history WHERE 1=1";
  const params = [];

  if (startDate) {
    query += " AND created_at >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND created_at <= ?";
    params.push(endDate);
  }
  if (feature_key) {
    query +=
      " AND feature_id IN (SELECT id FROM features WHERE feature_key = ?)";
    params.push(feature_key);
  }
  if (user_id) {
    query += " AND user_id = ?";
    params.push(user_id);
  }

  connection.query(query, params, (err, results) => {
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
