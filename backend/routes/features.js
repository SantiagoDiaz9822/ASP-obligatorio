const express = require("express");
const router = express.Router();
const connection = require("../db");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator"); 
const changeHistoryRouter = require("./changeHistory"); 

// Rutas protegidas (usa el middleware de autenticación)
router.use(auth);

// Ruta para definir un nuevo feature (protegida)
router.post(
  "/new",
  [
    body("project_id").notEmpty().withMessage("El project_id es requerido."),
    body("feature_key")
      .notEmpty()
      .matches(/^[a-zA-Z0-9_]+$/) // Solo alfanumérico y guión bajo
      .withMessage(
        "La key debe ser alfanumérica y no puede contener espacios."
      ),
    body("description").notEmpty().withMessage("La descripción es requerida."),
    body("state")
      .isIn(["on", "off"])
      .withMessage('El estado debe ser "on" o "off".'),
    body("conditions")
      .optional()
      .isArray()
      .withMessage("Las condiciones deben ser un array."),
  ],
  auth,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { project_id, feature_key, description, conditions, state } =
      req.body;

    const projectQuery = "SELECT company_id FROM projects WHERE id = ?";
    connection.query(projectQuery, [project_id], (err, projectResults) => {
      if (err) {
        console.error("Error al verificar el proyecto:", err);
        return res
          .status(500)
          .json({ message: "Error al verificar el proyecto." });
      }

      if (projectResults.length === 0) {
        return res
          .status(403)
          .json({ message: "No tienes acceso a este proyecto." });
      }

      const conditionsString = conditions ? JSON.stringify(conditions) : null;

      const query =
        "INSERT INTO features (project_id, feature_key, description, conditions, state) VALUES (?, ?, ?, ?, ?)";
      connection.query(
        query,
        [project_id, feature_key, description, conditionsString, state],
        (err, results) => {
          if (err) {
            console.error("Error al crear el feature:", err);
            return res
              .status(500)
              .json({ message: "Error al crear el feature." });
          }

          const action = "create"; 
          const changed_fields = {
            project_id,
            feature_key,
            description,
            conditions,
            state,
          };
          const changeQuery =
            "INSERT INTO change_history (feature_id, user_id, action, changed_fields) VALUES (?, ?, ?, ?)";
          connection.query(
            changeQuery,
            [
              results.insertId,
              req.userId,
              action,
              JSON.stringify(changed_fields),
            ],
            (err) => {
              if (err) {
                console.error("Error al registrar el cambio:", err);
              }
            }
          );

          res.status(201).json({
            message: "Feature creada exitosamente",
            featureId: results.insertId,
          });
        }
      );
    });
  }
);

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

// Actualizar una feature (permitir a todos los usuarios autenticados)
router.put(
  "/:id",
  auth,
  [
    body("description")
      .optional()
      .notEmpty()
      .withMessage("La descripción es requerida."),
    body("state")
      .optional()
      .isIn(["on", "off"])
      .withMessage('El estado debe ser "on" o "off".'),
    body("conditions")
      .optional()
      .isArray()
      .withMessage("Las condiciones deben ser un array."),
  ],
  (req, res) => {
    const featureId = req.params.id;
    const { description, conditions, state } = req.body;

    const featureQuery = `
      SELECT f.id, p.company_id 
      FROM features f 
      INNER JOIN projects p ON f.project_id = p.id 
      WHERE f.id = ? `;

    connection.query(featureQuery, [featureId], (err, results) => {
      if (err) {
        console.error("Error al verificar el feature:", err);
        return res
          .status(500)
          .json({ message: "Error al verificar el feature." });
      }

      if (results.length === 0) {
        return res
          .status(403)
          .json({ message: "No tienes acceso a este feature." });
      }

      const conditionsString = conditions ? JSON.stringify(conditions) : null;

      const query =
        "UPDATE features SET description = ?, conditions = ?, state = ? WHERE id = ?";
      connection.query(
        query,
        [description, conditionsString, state, featureId],
        (err, results) => {
          if (err) {
            console.error("Error al actualizar el feature:", err);
            return res
              .status(500)
              .json({ message: "Error al actualizar el feature." });
          }
          if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Feature no encontrada." });
          }

          const action = "update";
          const changed_fields = { description, conditions, state };
          const changeQuery =
            "INSERT INTO change_history (feature_id, user_id, action, changed_fields) VALUES (?, ?, ?, ?)";
          connection.query(
            changeQuery,
            [featureId, req.userId, action, JSON.stringify(changed_fields)],
            (err) => {
              if (err) {
                console.error("Error al registrar el cambio:", err);
              }
            }
          );

          res.json({ message: "Feature actualizada exitosamente" });
        }
      );
    });
  }
);

// Eliminar una feature (permitir a cualquier usuario autenticado)
router.delete("/:id", auth, (req, res) => {
  const featureId = req.params.id;

  const featureQuery = `
    SELECT f.id, p.company_id 
    FROM features f 
    INNER JOIN projects p ON f.project_id = p.id 
    WHERE f.id = ? AND p.company_id = ?`;

  connection.query(featureQuery, [featureId, req.companyId], (err, results) => {
    if (err) {
      console.error("Error al verificar el feature:", err);
      return res
        .status(500)
        .json({ message: "Error al verificar el feature." });
    }

    if (results.length === 0) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a este feature." });
    }

    const query = "DELETE FROM features WHERE id = ?";
    connection.query(query, [featureId], (err, results) => {
      if (err) {
        console.error("Error al eliminar el feature:", err);
        return res
          .status(500)
          .json({ message: "Error al eliminar el feature." });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Feature no encontrada." });
      }

      const action = "delete";
      const changed_fields = { featureId };
      const changeQuery =
        "INSERT INTO change_history (feature_id, user_id, action, changed_fields) VALUES (?, ?, ?, ?)";
      connection.query(
        changeQuery,
        [featureId, req.userId, action, JSON.stringify(changed_fields)],
        (err) => {
          if (err) {
            console.error("Error al registrar el cambio:", err);
          }
        }
      );

      res.json({ message: "Feature eliminada exitosamente" });
    });
  });
});

module.exports = router;
