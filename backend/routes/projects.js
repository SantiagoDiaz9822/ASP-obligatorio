const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos

// Crear un nuevo proyecto
router.post("/new", (req, res) => {
  const { company_id, name, description, api_key } = req.body;

  if (!company_id || !name || !description || !api_key) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  const query =
    "INSERT INTO projects (company_id, name, description, api_key) VALUES (?, ?, ?, ?)";
  connection.query(
    query,
    [company_id, name, description, api_key],
    (err, results) => {
      if (err) {
        console.error("Error al crear el proyecto:", err);
        return res.status(500).json({ message: "Error al crear el proyecto." });
      }
      res.status(201).json({
        message: "Proyecto creado exitosamente",
        projectId: results.insertId,
      });
    }
  );
});

// Leer todos los proyectos
router.get("/", (req, res) => {
  const query = "SELECT * FROM projects";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los proyectos:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los proyectos." });
    }
    res.json(results);
  });
});

// Leer un proyecto por ID
router.get("/:id", (req, res) => {
  const projectId = req.params.id;

  const query = "SELECT * FROM projects WHERE id = ?";
  connection.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error al obtener el proyecto:", err);
      return res.status(500).json({ message: "Error al obtener el proyecto." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado." });
    }
    res.json(results[0]);
  });
});

// Actualizar un proyecto
router.put("/:id", (req, res) => {
  const projectId = req.params.id;
  const { name, description, api_key } = req.body;

  const query =
    "UPDATE projects SET name = ?, description = ?, api_key = ? WHERE id = ?";
  connection.query(
    query,
    [name, description, api_key, projectId],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar el proyecto:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar el proyecto." });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Proyecto no encontrado." });
      }
      res.json({ message: "Proyecto actualizado exitosamente" });
    }
  );
});

// Eliminar un proyecto
router.delete("/:id", (req, res) => {
  const projectId = req.params.id;

  const query = "DELETE FROM projects WHERE id = ?";
  connection.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error al eliminar el proyecto:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar el proyecto." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado." });
    }
    res.json({ message: "Proyecto eliminado exitosamente" });
  });
});

module.exports = router;
