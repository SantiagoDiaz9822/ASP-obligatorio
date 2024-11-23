const connection = require("../config/db");
const { validationResult } = require("express-validator");
const { evaluateConditions } = require("../services/conditionEvaluator");

// Crear una nueva feature
const createFeature = (req, res) => {
  const { project_id, feature_key, description, conditions, state } = req.body;

  // Validación de los datos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
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
};

// Leer todas las features de un proyecto
const getFeaturesByProjectId = (req, res) => {
  const projectId = req.params.id;

  const query = "SELECT * FROM features WHERE project_id = ?";
  connection.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error al obtener las features:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener las features." });
    }

    res.json(results);
  });
};

// Leer una feature por ID
const getFeatureById = (req, res) => {
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
};

// Evaluar el estado de una feature
const evaluateFeature = (req, res) => {
  const { feature_key, context } = req.body;

  const query = "SELECT * FROM features WHERE feature_key = ?";
  connection.query(query, [feature_key], (err, results) => {
    if (err) {
      console.error("Error al obtener la feature:", err);
      return res.status(500).json({ message: "Error al obtener la feature." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Feature no encontrada." });
    }

    const feature = results[0];
    const conditions = feature.conditions ? JSON.parse(feature.conditions) : [];
    const isFeatureEnabled = evaluateConditions(conditions, context);

    res.json({ value: isFeatureEnabled });
  });
};

module.exports = {
  createFeature,
  getFeaturesByProjectId,
  getFeatureById,
  evaluateFeature,
};
