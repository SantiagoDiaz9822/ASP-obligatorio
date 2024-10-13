const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos

// Ruta para consultar el estado de una característica mediante su feature_key
router.post("/:feature_key", async (req, res) => {
  const featureKey = req.params.feature_key;
  const context = req.body;

  // Validar que se reciba el feature_key y el contexto
  if (!featureKey || !context) {
    return res
      .status(400)
      .json({ message: "feature_key y context son requeridos." });
  }

  // Consultar la base de datos para obtener la característica
  const query = "SELECT * FROM features WHERE feature_key = ?";
  connection.query(query, [featureKey], (err, results) => {
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

    // Evaluar si el feature está habilitado
    const isFeatureEnabled = evaluateConditions(conditions, context);

    // Registrar el uso del feature
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
  let isEnabled = true; // Inicializa el estado de la característica

  for (const condition of conditions) {
    const { field, operator, value } = condition;

    // Realiza la evaluación de la condición según el operador
    switch (operator) {
      case "equals":
        isEnabled = isEnabled && context[field] === value;
        break;
      case "different":
        isEnabled = isEnabled && context[field] !== value;
        break;
      case "greater":
        isEnabled = isEnabled && parseFloat(context[field]) > parseFloat(value);
        break;
      case "lower":
        isEnabled = isEnabled && parseFloat(context[field]) < parseFloat(value);
        break;
      case "in":
        if (Array.isArray(value)) {
          isEnabled = isEnabled && value.includes(context[field]);
        } else {
          console.error("El valor debe ser un array para el operador 'in'");
          isEnabled = false;
        }
        break;
      default:
        console.error("Operador no reconocido:", operator);
        isEnabled = false;
    }

    // Si en algún punto isEnabled es false, podemos salir del bucle
    if (!isEnabled) break;
  }

  return isEnabled;
}

module.exports = router;
