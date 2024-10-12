const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos
const auth = require("../middleware/auth"); // Importa el middleware de autenticación
const authorize = require("../middleware/authorize"); // Importa el middleware de autorización
const { body, validationResult } = require("express-validator"); // Para validaciones
const changeHistoryRouter = require("./changeHistory"); // Ruta de cambios

// Rutas protegidas (usa el middleware de autenticación)
router.use(auth);

// Ruta para definir un nuevo feature (protegida)
router.post(
  "/new",
  [
    body("project_id").notEmpty().withMessage("El project_id es requerido."),
    body("feature_key")
      .notEmpty()
      .matches(/^[a-zA-Z0-9_]+$/) // Validar que sea alfanumérica sin espacios
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
  auth, // Solo autenticación, sin necesidad de que sea admin
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { project_id, feature_key, description, conditions, state } =
      req.body;

    // Verificar que el proyecto pertenezca a la empresa del usuario
    const projectQuery =
      "SELECT company_id FROM projects WHERE id = ? AND company_id = ?";
    connection.query(
      projectQuery,
      [project_id, req.companyId],
      (err, projectResults) => {
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

        // Si el proyecto pertenece a la empresa del usuario, continuamos con la creación
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

            // Registrar el cambio
            const action = "create"; // Acción realizada
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
      }
    );
  }
);

// Leer todas las features (solo administradores)
router.get("/", authorize("admin"), (req, res) => {
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

// Actualizar una feature (permitir a todos los usuarios autenticados)
router.put(
  "/:id",
  auth, // Permitir a cualquier usuario autenticado
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

    // Verificar que el feature pertenece a un proyecto de la empresa del usuario
    const featureQuery = `
      SELECT f.id, p.company_id 
      FROM features f 
      INNER JOIN projects p ON f.project_id = p.id 
      WHERE f.id = ? AND p.company_id = ?`;

    connection.query(
      featureQuery,
      [featureId, req.companyId],
      (err, results) => {
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

        // Si el feature pertenece a la empresa del usuario, permitimos la edición
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
              return res
                .status(404)
                .json({ message: "Feature no encontrada." });
            }

            // Registrar el cambio
            const action = "update"; // Acción realizada
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
      }
    );
  }
);

// Eliminar una feature (permitir a cualquier usuario autenticado)
router.delete("/:id", auth, (req, res) => {
  const featureId = req.params.id;

  // Verificar que el feature pertenece a un proyecto de la empresa del usuario
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

      // Registrar el cambio
      const action = "delete"; // Acción realizada
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

// Ruta para consultar el estado de una característica y registrar el uso
router.post("/check", (req, res) => {
  const { feature_key, context } = req.body;

  // Validar que se reciba el feature_key y el contexto
  if (!feature_key || !context) {
    return res
      .status(400)
      .json({ message: "feature_key y context son requeridos." });
  }

  // Consultar la base de datos para obtener la característica
  const query = "SELECT * FROM features WHERE feature_key = ?";
  connection.query(query, [feature_key], (err, results) => {
    if (err) {
      console.error("Error al obtener la característica:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener la característica." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Característica no encontrada." });
    }

    const feature = results[0];

    // Depurar el valor de feature.conditions
    console.log("Valor de feature.conditions:", feature.conditions);

    // Manejar posibles problemas al parsear feature.conditions
    let conditions = [];
    if (typeof feature.conditions === "string" && feature.conditions !== null) {
      try {
        conditions = JSON.parse(feature.conditions);
      } catch (e) {
        console.error("Error al parsear feature.conditions:", e);
        conditions = [];
      }
    } else if (Array.isArray(feature.conditions)) {
      conditions = feature.conditions;
    } else {
      console.error(
        "feature.conditions no es ni string ni array:",
        feature.conditions
      );
    }

    const isFeatureEnabled = evaluateConditions(conditions, context);

    // Registrar el uso de la característica en la tabla usage_logs
    const usageLogQuery =
      "INSERT INTO usage_logs (feature_id, project_id, context, response, created_at) VALUES (?, ?, ?, ?, NOW())";
    connection.query(
      usageLogQuery,
      [
        feature.id,
        feature.project_id,
        JSON.stringify(context),
        isFeatureEnabled,
      ],
      (err) => {
        if (err) {
          console.error("Error al registrar el uso:", err);
        }
      }
    );

    // Devolver el estado de la característica
    res.json({ value: isFeatureEnabled });
  });
});

// Función para evaluar condiciones
function evaluateConditions(conditions, context) {
  // Inicializa el estado de la característica
  let isEnabled = true;

  for (const condition of conditions) {
    const { campo, operador, valor } = condition;

    // Realiza la evaluación de la condición según el operador
    switch (operador) {
      case "equals":
        isEnabled = isEnabled && context[campo] === valor;
        break;
      case "different":
        isEnabled = isEnabled && context[campo] !== valor;
        break;
      case "greater":
        isEnabled = isEnabled && context[campo] > valor;
        break;
      case "lower":
        isEnabled = isEnabled && context[campo] < valor;
        break;
      case "in":
        if (Array.isArray(valor)) {
          isEnabled = isEnabled && valor.includes(context[campo]);
        } else {
          console.error("El valor debe ser un array para el operador 'in'");
          isEnabled = false;
        }
        break;
      default:
        console.error("Operador no reconocido:", operador);
        isEnabled = false;
    }

    // Si en algún punto isEnabled es false, podemos salir del bucle
    if (!isEnabled) break;
  }

  return isEnabled;
}

module.exports = router;
