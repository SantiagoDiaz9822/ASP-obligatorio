const connection = require("../config/db");
const { generateApiKey } = require("../services/apiKeyGenerator");
const { validationResult } = require("express-validator");

// Crear un nuevo proyecto
const createProject = (req, res) => {
  const { name, description } = req.body;
  const userId = req.userId;

  // Validación de los datos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Obtener el company_id del usuario actual
  const queryUser = "SELECT company_id FROM users WHERE id = ?";
  connection.query(queryUser, [userId], (err, userResults) => {
    if (err) {
      console.error("Error al obtener la empresa del usuario:", err);
      return res.status(500).json({ message: "Error al obtener la empresa." });
    }

    const companyId = userResults[0].company_id;

    const apiKey = generateApiKey();

    const query =
      "INSERT INTO projects (name, description, company_id, api_key) VALUES (?, ?, ?, ?)";
    connection.query(
      query,
      [name, description, companyId, apiKey],
      (err, results) => {
        if (err) {
          console.error("Error al crear el proyecto:", err);
          return res
            .status(500)
            .json({ message: "Error al crear el proyecto." });
        }

        res.status(201).json({
          message: "Proyecto creado exitosamente",
          projectId: results.insertId,
          apiKey,
        });
      }
    );
  });
};

// Leer todos los proyectos de la empresa
const getAllProjects = (req, res) => {
  const userId = req.userId;

  // Obtener el company_id del usuario actual
  const queryUser = "SELECT company_id FROM users WHERE id = ?";
  connection.query(queryUser, [userId], (err, userResults) => {
    if (err) {
      console.error("Error al obtener la empresa del usuario:", err);
      return res.status(500).json({ message: "Error al obtener la empresa." });
    }

    const companyId = userResults[0].company_id;

    const query = "SELECT * FROM projects WHERE company_id = ?";
    connection.query(query, [companyId], (err, results) => {
      if (err) {
        console.error("Error al obtener los proyectos:", err);
        return res
          .status(500)
          .json({ message: "Error al obtener los proyectos." });
      }

      res.json(results);
    });
  });
};

// Leer un proyecto por ID
const getProjectById = (req, res) => {
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
};

module.exports = { createProject, getAllProjects, getProjectById };
