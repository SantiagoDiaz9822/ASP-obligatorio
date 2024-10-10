const express = require("express");
const router = express.Router();
const connection = require("../db"); // Asegúrate de tener la conexión configurada en db.js

// Crear una nueva empresa
router.post("/new", (req, res) => {
  const { name, address, logo_url } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  const query =
    "INSERT INTO companies (name, address, logo_url) VALUES (?, ?, ?)";
  connection.query(query, [name, address, logo_url], (err, results) => {
    if (err) {
      console.error("Error al crear la empresa:", err);
      return res.status(500).json({ message: "Error al crear la empresa." });
    }
    res
      .status(201)
      .json({
        message: "Empresa creada exitosamente",
        companyId: results.insertId,
      });
  });
});

// Leer todas las empresas
router.get("/", (req, res) => {
  const query = "SELECT * FROM companies";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener las empresas:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener las empresas." });
    }
    res.json(results);
  });
});

// Leer una empresa por ID
router.get("/:id", (req, res) => {
  const companyId = req.params.id;

  const query = "SELECT * FROM companies WHERE id = ?";
  connection.query(query, [companyId], (err, results) => {
    if (err) {
      console.error("Error al obtener la empresa:", err);
      return res.status(500).json({ message: "Error al obtener la empresa." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada." });
    }
    res.json(results[0]);
  });
});

// Actualizar una empresa
router.put("/:id", (req, res) => {
  const companyId = req.params.id;
  const { name, address, logo_url } = req.body;

  const query =
    "UPDATE companies SET name = ?, address = ?, logo_url = ? WHERE id = ?";
  connection.query(
    query,
    [name, address, logo_url, companyId],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar la empresa:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar la empresa." });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Empresa no encontrada." });
      }
      res.json({ message: "Empresa actualizada exitosamente" });
    }
  );
});

// Eliminar una empresa
router.delete("/:id", (req, res) => {
  const companyId = req.params.id;

  const query = "DELETE FROM companies WHERE id = ?";
  connection.query(query, [companyId], (err, results) => {
    if (err) {
      console.error("Error al eliminar la empresa:", err);
      return res.status(500).json({ message: "Error al eliminar la empresa." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Empresa no encontrada." });
    }
    res.json({ message: "Empresa eliminada exitosamente" });
  });
});

module.exports = router;
