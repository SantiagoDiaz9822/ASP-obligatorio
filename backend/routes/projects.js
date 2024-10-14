const express = require("express");
const router = express.Router();
const connection = require("../db");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Función para generar un API Key
const generateApiKey = () => {
  return require("crypto").randomBytes(20).toString("hex");
};

// Rutas protegidas (usa el middleware de autenticación)
router.use(auth);

// Ruta para definir un nuevo proyecto (protegida)
router.post(
  "/new",
  [
    body("name").notEmpty().withMessage("El nombre del proyecto es requerido."),
    body("description").notEmpty().withMessage("La descripción es requerida."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    const userId = req.userId;

    const queryUser = "SELECT company_id FROM users WHERE id = ?";
    connection.query(queryUser, [userId], (err, userResults) => {
      if (err) {
        console.error("Error al obtener la empresa del usuario:", err);
        return res
          .status(500)
          .json({ message: "Error al obtener la empresa del usuario." });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const companyId = userResults[0].company_id;

      const query =
        "INSERT INTO projects (name, description, company_id) VALUES (?, ?, ?)";
      connection.query(
        query,
        [name, description, companyId],
        (err, results) => {
          if (err) {
            console.error("Error al crear el proyecto:", err);
            return res
              .status(500)
              .json({ message: "Error al crear el proyecto." });
          }

          const apiKey = generateApiKey();

          const updateQuery = "UPDATE projects SET api_key = ? WHERE id = ?";
          connection.query(updateQuery, [apiKey, results.insertId], (err) => {
            if (err) {
              console.error("Error al asignar el API Key:", err);
              return res
                .status(500)
                .json({ message: "Error al asignar el API Key." });
            }

            res.status(201).json({
              message: "Proyecto creado exitosamente",
              projectId: results.insertId,
              apiKey,
            });
          });
        }
      );
    });
  }
);

// Leer todos los proyectos del usuario
router.get("/", (req, res) => {
  const userId = req.userId; 

  const queryUser = "SELECT company_id FROM users WHERE id = ?";
  connection.query(queryUser, [userId], (err, userResults) => {
    if (err) {
      console.error("Error al obtener la empresa del usuario:", err);
      return res.status(500).json({ message: "Error al obtener la empresa." });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
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

      if (results.length === 0) {
        return res.status(200).json([]);
      }

      res.json(results);
    });
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

// Obtener todas las features de un proyecto específico
router.get("/:id/features", (req, res) => {
  const projectId = req.params.id;

  const projectQuery = `SELECT company_id FROM projects WHERE id = ?`;
  connection.query(projectQuery, [projectId], (err, results) => {
    if (err) {
      console.error("Error al verificar el proyecto:", err);
      return res
        .status(500)
        .json({ message: "Error al verificar el proyecto." });
    }

    if (results.length === 0) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a este proyecto." });
    }

    const query = "SELECT * FROM features WHERE project_id = ?";
    connection.query(query, [projectId], (err, features) => {
      if (err) {
        console.error("Error al obtener las features:", err);
        return res
          .status(500)
          .json({ message: "Error al obtener las features." });
      }
      res.json(features);
    });
  });
});

// Eliminar un proyecto (solo si no tiene features)
router.delete("/:id", (req, res) => {
  const projectId = req.params.id;

  const checkFeaturesQuery =
    "SELECT COUNT(*) AS count FROM features WHERE project_id = ?";
  connection.query(checkFeaturesQuery, [projectId], (err, results) => {
    if (err) {
      console.error("Error al verificar las features:", err);
      return res
        .status(500)
        .json({ message: "Error al verificar las features." });
    }

    if (results[0].count > 0) {
      return res.status(400).json({
        message:
          "No se puede eliminar un proyecto que tiene features asociadas.",
      });
    }

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
});

module.exports = router;
