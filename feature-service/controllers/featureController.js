const connection = require("../config/db");
const { evaluateConditions } = require("../services/conditionEvaluator");
const axios = require("axios"); // Asegúrate de tener axios instalado

// Crear una nueva feature
const createFeature = (req, res) => {
  const { project_id, feature_key, description, state, conditions } = req.body;
  const userId = req.userId;

  // Verificar que el project_id existe llamando al Project Service
  axios
    .get(`${process.env.PROJECT_SERVICE_URL}/api/projects/${project_id}`)
    .then((response) => {
      // Si el proyecto existe, continuamos con la creación de la feature
      const query =
        "INSERT INTO features (project_id, feature_key, description, state, conditions) VALUES (?, ?, ?, ?, ?)";
      connection.query(
        query,
        [project_id, feature_key, description, state, conditions],
        (err, results) => {
          if (err) {
            console.error("Error al crear la feature:", err);
            return res.status(500).json({ message: "Error al crear la feature." });
          }

          // Registrar la creación de la feature en el servicio de auditoría
          axios
            .post(`${process.env.AUDIT_SERVICE_URL}/api/audit/log`, {
              action: "create",
              entity: "feature",
              entityId: results.insertId,
              details: { feature_key, description, state, conditions },
              userId: userId,
            })
            .then(() => {
              console.log("Auditoría registrada para la creación de la feature.");
            })
            .catch((err) => {
              console.error("Error al registrar la auditoría:", err);
            });

          res.status(201).json({ message: "Feature creada exitosamente" });
        }
      );
    })
    .catch((err) => {
      console.error("Error al verificar el proyecto:", err);
      return res.status(404).json({ message: "Proyecto no encontrado." });
    });
};


// Modificar una feature
const updateFeature = (req, res) => {
  const featureId = req.params.id;
  const { description, state, conditions } = req.body;
  const userId = req.userId;

  const query =
    "UPDATE features SET description = ?, state = ?, conditions = ? WHERE id = ?";
  connection.query(
    query,
    [description, state, conditions, featureId],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar la feature:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar la feature." });
      }

      // Registrar la modificación de la feature en el servicio de auditoría
      axios
        .post(`${process.env.AUDIT_SERVICE_URL}/api/audit/log`, {
          action: "update",
          entity: "feature",
          entityId: featureId,
          details: { description, state, conditions },
          userId: userId, 
        })
        .then(() => {
          console.log(
            "Auditoría registrada para la modificación de la feature."
          );
        })
        .catch((err) => {
          console.error("Error al registrar la auditoría:", err);
        });

      res.json({ message: "Feature actualizada exitosamente" });
    }
  );
};

// Eliminar una feature
const deleteFeature = (req, res) => {
  const featureId = req.params.id;
  const userId = req.userId;

  const query = "DELETE FROM features WHERE id = ?";
  connection.query(query, [featureId], (err, results) => {
    if (err) {
      console.error("Error al eliminar la feature:", err);
      return res.status(500).json({ message: "Error al eliminar la feature." });
    }

    // Registrar la eliminación de la feature en el servicio de auditoría
    axios
      .post(`${process.env.AUDIT_SERVICE_URL}/api/audit/log`, {
        action: "delete",
        entity: "feature",
        entityId: featureId,
        details: { featureId },
        userId: userId,
      })
      .then(() => {
        console.log("Auditoría registrada para la eliminación de la feature.");
      })
      .catch((err) => {
        console.error("Error al registrar la auditoría:", err);
      });

    res.json({ message: "Feature eliminada exitosamente" });
  });
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
const evaluateFeature = async (req, res) => {
  const { feature_key, context } = req.body;

  // Consultar la feature en la base de datos
  const query = "SELECT * FROM features WHERE feature_key = ?";
  connection.query(query, [feature_key], async (err, results) => {
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

    // Intentar registrar el uso en el servicio de reportes
    try {
      await axios.post(`${process.env.REPORT_SERVICE_URL}/api/reports/log`, {
        feature_id: feature.id,
        project_id: feature.project_id,
        context,
        response: isFeatureEnabled,
      });
    } catch (error) {
      console.error("Error al registrar el uso en el servicio de reportes:", error.message);
    }

    // Responder al cliente
    res.json({ value: isFeatureEnabled });
  });
};

module.exports = {
  createFeature,
  updateFeature,
  deleteFeature,
  getFeaturesByProjectId,
  getFeatureById,
  evaluateFeature,
};
