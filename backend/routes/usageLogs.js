const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos

// Crear un nuevo registro de uso
router.post("/new", (req, res) => {
  const { project_id, feature_id, context, response } = req.body;

  if (!project_id || !feature_id || response === undefined) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  const query =
    "INSERT INTO usage_logs (project_id, feature_id, context, response) VALUES (?, ?, ?, ?)";
  connection.query(
    query,
    [project_id, feature_id, JSON.stringify(context), response],
    (err, results) => {
      if (err) {
        console.error("Error al crear el registro de uso:", err);
        return res
          .status(500)
          .json({ message: "Error al crear el registro de uso." });
      }
      res.status(201).json({
        message: "Registro de uso creado exitosamente",
        logId: results.insertId,
      });
    }
  );
});

// Leer todos los registros de uso
router.get("/", (req, res) => {
  const query = "SELECT * FROM usage_logs";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los registros de uso:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los registros de uso." });
    }
    res.json(results);
  });
});

// Leer un registro de uso por ID
router.get("/:id", (req, res) => {
  const logId = req.params.id;

  const query = "SELECT * FROM usage_logs WHERE id = ?";
  connection.query(query, [logId], (err, results) => {
    if (err) {
      console.error("Error al obtener el registro de uso:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener el registro de uso." });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Registro de uso no encontrado." });
    }
    res.json(results[0]);
  });
});

// Actualizar un registro de uso
router.put("/:id", (req, res) => {
  const logId = req.params.id;
  const { project_id, feature_id, context, response } = req.body;

  const query =
    "UPDATE usage_logs SET project_id = ?, feature_id = ?, context = ?, response = ? WHERE id = ?";
  connection.query(
    query,
    [project_id, feature_id, JSON.stringify(context), response, logId],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar el registro de uso:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar el registro de uso." });
      }
      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Registro de uso no encontrado." });
      }
      res.json({ message: "Registro de uso actualizado exitosamente" });
    }
  );
});

// Eliminar un registro de uso
router.delete("/:id", (req, res) => {
  const logId = req.params.id;

  const query = "DELETE FROM usage_logs WHERE id = ?";
  connection.query(query, [logId], (err, results) => {
    if (err) {
      console.error("Error al eliminar el registro de uso:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar el registro de uso." });
    }
    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Registro de uso no encontrado." });
    }
    res.json({ message: "Registro de uso eliminado exitosamente" });
  });
});

module.exports = router;
