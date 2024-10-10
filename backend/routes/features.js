const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos

// Crear una nueva feature
router.post("/new", (req, res) => {
  const { project_id, feature_key, description, conditions, state } = req.body; // Cambia `key` a `feature_key`

  if (!project_id || !feature_key || !description || state === undefined) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  const query =
    "INSERT INTO features (project_id, feature_key, description, conditions, state) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    query,
    [project_id, feature_key, description, JSON.stringify(conditions), state],
    (err, results) => {
      if (err) {
        console.error("Error al crear la feature:", err);
        return res.status(500).json({ message: "Error al crear la feature." });
      }
      res.status(201).json({
        message: "Feature creada exitosamente",
        featureId: results.insertId,
      });
    }
  );
});

// Leer todas las features
router.get("/", (req, res) => {
  const query = "SELECT * FROM features";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener las features:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener las features." });
    }
    res.json(results);
  });
});

// Leer una feature por ID
router.get("/:id", (req, res) => {
  const featureId = req.params.id;

  const query = "SELECT * FROM features WHERE id = ?";
  connection.query(query, [featureId], (err, results) => {
    if (err) {
      console.error("Error al obtener la feature:", err);
      return res.status(500).json({ message: "Error al obtener la feature." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Feature no encontrada." });
    }
    res.json(results[0]);
  });
});

// Actualizar una feature
router.put("/:id", (req, res) => {
  const featureId = req.params.id;
  const { feature_key, description, conditions, state } = req.body; // Cambia `key` a `feature_key`

  const query =
    "UPDATE features SET feature_key = ?, description = ?, conditions = ?, state = ? WHERE id = ?";
  connection.query(
    query,
    [feature_key, description, JSON.stringify(conditions), state, featureId],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar la feature:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar la feature." });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Feature no encontrada." });
      }
      res.json({ message: "Feature actualizada exitosamente" });
    }
  );
});

// Eliminar una feature
router.delete("/:id", (req, res) => {
  const featureId = req.params.id;

  const query = "DELETE FROM features WHERE id = ?";
  connection.query(query, [featureId], (err, results) => {
    if (err) {
      console.error("Error al eliminar la feature:", err);
      return res.status(500).json({ message: "Error al eliminar la feature." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Feature no encontrada." });
    }
    res.json({ message: "Feature eliminada exitosamente" });
  });
});

module.exports = router;
