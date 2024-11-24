const connection = require("../config/db");

const axios = require("axios"); // Asegúrate de tener axios instalado

// Crear una nueva empresa
const createCompany = (req, res) => {
  const { name, address } = req.body;
  const logoUrl = req.file ? req.file.location : null; // Obtener la URL del logo subido a S3
  const userId = req.userId; // Obtener el userId del token

  const query =
    "INSERT INTO companies (name, address, logo_url) VALUES (?, ?, ?)";
  connection.query(query, [name, address, logoUrl], (err, results) => {
    if (err) {
      console.error("Error al crear la empresa:", err);
      return res.status(500).json({ message: "Error al crear la empresa." });
    }

    // Registrar la creación de la empresa en el servicio de auditoría
    axios
      .post(
        `${process.env.AUDIT_SERVICE_URL}/log`,
        {
          action: "create",
          entity: "company",
          entityId: results.insertId,
          details: { name, address, logoUrl },
          userId: userId,
        },
        {
          headers: {
            Authorization: req.headers["authorization"], // El token se pasa correctamente en los headers
          },
        }
      )
      .then(() => {
        console.log("Auditoría registrada para la creación de la empresa.");
      })
      .catch((err) => {
        console.error("Error al registrar la auditoría:", err);
      });

    res.status(201).json({ message: "Empresa creada exitosamente" });
  });
};

// Eliminar una empresa
const deleteCompany = (req, res) => {
  const companyId = req.params.id;
  const userId = req.userId;

  const query = "DELETE FROM companies WHERE id = ?";
  connection.query(query, [companyId], (err, results) => {
    if (err) {
      console.error("Error al eliminar la empresa:", err);
      return res.status(500).json({ message: "Error al eliminar la empresa." });
    }

    // Registrar la eliminación de la empresa en el servicio de auditoría
    axios
      .post(
        `${process.env.AUDIT_SERVICE_URL}/log`,
        {
          action: "delete",
          entity: "company",
          entityId: companyId,
          details: { companyId },
          userId: userId,
        },
        {
          headers: {
            Authorization: req.headers["authorization"], // El token se pasa correctamente en los headers
          },
        }
      )
      .then(() => {
        console.log("Auditoría registrada para la eliminación de la empresa.");
      })
      .catch((err) => {
        console.error("Error al registrar la auditoría:", err);
      });

    res.json({ message: "Empresa eliminada exitosamente" });
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

module.exports = {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompanyById,
};
