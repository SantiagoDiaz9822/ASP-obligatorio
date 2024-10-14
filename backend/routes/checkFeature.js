const express = require("express");
const router = express.Router();
const connection = require("../db");
const redis = require("redis");

let isRedisConnected = false;

// Configura Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

// Conectar a Redis
redisClient
  .connect()
  .then(() => {
    console.log("Conectado a Redis");
    isRedisConnected = true;
  })
  .catch((err) => {
    console.error("Error conectando a Redis");
    isRedisConnected = false;
  });

// Maneja los errores de Redis
redisClient.on("error", (err) => {
  console.error("Error conectando a Redis");
  isRedisConnected = false;
});

/**
 * @swagger
 * tags:
 *   name: Feature Check
 *   description: API para consultar el estado de las características
 */

/**
 * @swagger
 * /check-feature/{feature_key}:
 *   post:
 *     summary: Consultar el estado de una característica
 *     tags: [Feature Check]
 *     parameters:
 *       - in: path
 *         name: feature_key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de la característica a consultar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               context:
 *                 type: object
 *                 description: Contexto para evaluar la característica
 *                 example:
 *                   userRole: "admin"
 *                   userId: 123
 *     responses:
 *       200:
 *         description: Estado de la característica consultada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 value:
 *                   type: boolean
 *                   description: Indica si la característica está habilitada
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Característica no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post("/:feature_key", async (req, res) => {
  const featureKey = req.params.feature_key;
  const context = req.body;

  if (!featureKey || !context) {
    return res
      .status(400)
      .json({ message: "feature_key y context son requeridos." });
  }

  try {
    let isFeatureEnabled;
    let cachedData;

    if (isRedisConnected) {
      cachedData = await redisClient.get(featureKey);
    }

    if (cachedData) {
      isFeatureEnabled = JSON.parse(cachedData).value;
    } else {
      const query = "SELECT * FROM features WHERE feature_key = ?";
      const results = await new Promise((resolve, reject) => {
        connection.query(query, [featureKey], (err, results) => {
          if (err) {
            reject(err);
          }
          resolve(results);
        });
      });

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Característica no encontrada." });
      }

      const feature = results[0];

      let conditions = [];
      if (
        typeof feature.conditions === "string" &&
        feature.conditions !== null
      ) {
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

      isFeatureEnabled = evaluateConditions(conditions, context);

      if (isRedisConnected) {
        await redisClient.setEx(
          featureKey,
          3600,
          JSON.stringify({ value: isFeatureEnabled })
        );
      }

      const usageLogQuery =
        "INSERT INTO usage_logs (feature_id, project_id, context, response, created_at) VALUES (?, ?, ?, ?, NOW())";
      await new Promise((resolve, reject) => {
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
              reject(err);
            }
            resolve();
          }
        );
      });
    }

    return res.json({ value: isFeatureEnabled });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Función para evaluar condiciones
function evaluateConditions(conditions, context) {
  let isEnabled = true;

  for (const condition of conditions) {
    const { field, operator, value } = condition;

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

    if (!isEnabled) break;
  }

  return isEnabled;
}

module.exports = router;
