const connection = require("../config/db");
const s3 = require("../config/s3");
const { validationResult } = require("express-validator");

// Crear una nueva empresa
const createCompany = (req, res) => {
  const { name, address } = req.body;
  const logoUrl = req.file ? req.file.location : null; // URL del logo en S3

  // Validación de los datos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const query =
    "INSERT INTO companies (name, address, logo_url) VALUES (?, ?, ?)";
  connection.query(query, [name, address, logoUrl], (err, results) => {
    if (err) {
      console.error("Error al crear la empresa:", err);
      return res.status(500).json({ message: "Error al crear la empresa." });
    }
    res.status(201).json({
      message: "Empresa creada exitosamente",
      companyId: results.insertId,
      logoUrl,
    });
  });
};

// Leer todas las empresas
const getAllCompanies = (req, res) => {
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
};

// Leer una empresa por ID
const getCompanyById = (req, res) => {
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
};

module.exports = { createCompany, getAllCompanies, getCompanyById };
