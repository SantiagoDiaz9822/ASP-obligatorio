const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos
const auth = require("../middleware/auth"); // Middleware de autenticación
const authorize = require("../middleware/authorize"); // Middleware de autorización
const { body, validationResult } = require("express-validator"); // Para validaciones

// Rutas protegidas (usa el middleware de autenticación)
router.use(auth);

// Ruta para obtener el reporte de uso (solo administradores)
router.get("/report", authorize("admin"), (req, res) => {
  const { startDate, endDate, project_id } = req.query;

  // Validar parámetros
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate y endDate son requeridos." });
  }

  // Convertir fechas a formato SQL si es necesario
  const start = new Date(startDate)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const end = new Date(endDate).toISOString().slice(0, 19).replace("T", " ");

  // Consultar registros de uso filtrando por fecha y opcionalmente por proyecto
  let query = `
    SELECT feature_id, COUNT(*) AS usage_count, HOUR(created_at) AS hour
    FROM usage_logs
    WHERE created_at BETWEEN ? AND ?
  `;
  const params = [start, end];

  // Filtro opcional por proyecto
  if (project_id) {
    query += " AND project_id = ?";
    params.push(project_id);
  }

  query += " GROUP BY feature_id, hour";

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Error al obtener el reporte de uso:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener el reporte de uso." });
    }
    res.json(results);
  });
});

// Crear un nuevo registro de uso
router.post(
  "/new",
  [
    body("project_id").notEmpty().withMessage("El project_id es requerido."),
    body("feature_id").notEmpty().withMessage("El feature_id es requerido."),
    body("context").isObject().withMessage("El contexto debe ser un objeto."),
    body("response")
      .isBoolean()
      .withMessage("La respuesta debe ser un booleano."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { project_id, feature_id, context, response } = req.body;

    const query =
      "INSERT INTO usage_logs (project_id, feature_id, context, response) VALUES (?, ?, ?, ?)";
    connection.query(
      query,
      [project_id, feature_id, JSON.stringify(context), response],
      (err, results) => {
        if (err) {
          console.error("Error al crear el registro de uso:", err);
          return res
            .status(500)
            .json({ message: "Error al crear el registro de uso." });
        }
        res.status(201).json({
          message: "Registro de uso creado exitosamente",
          logId: results.insertId,
        });
      }
    );
  }
);

// Leer todos los registros de uso (solo administradores)
router.get("/", authorize("admin"), (req, res) => {
  const query = "SELECT * FROM usage_logs";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los registros de uso:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los registros de uso." });
    }
    res.json(results);
  });
});

// Leer un registro de uso por ID
router.get("/:id", (req, res) => {
  const logId = req.params.id;

  const query = "SELECT * FROM usage_logs WHERE id = ?";
  connection.query(query, [logId], (err, results) => {
    if (err) {
      console.error("Error al obtener el registro de uso:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener el registro de uso." });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Registro de uso no encontrado." });
    }
    res.json(results[0]);
  });
});

// Actualizar un registro de uso (solo administradores)
router.put(
  "/:id",
  authorize("admin"),
  [
    body("project_id")
      .optional()
      .notEmpty()
      .withMessage("El project_id no puede estar vacío."),
    body("feature_id")
      .optional()
      .notEmpty()
      .withMessage("El feature_id no puede estar vacío."),
    body("context")
      .optional()
      .isObject()
      .withMessage("El contexto debe ser un objeto."),
    body("response")
      .optional()
      .isBoolean()
      .withMessage("La respuesta debe ser un booleano."),
  ],
  (req, res) => {
    const logId = req.params.id;
    const { project_id, feature_id, context, response } = req.body;

    const query =
      "UPDATE usage_logs SET project_id = ?, feature_id = ?, context = ?, response = ? WHERE id = ?";
    connection.query(
      query,
      [project_id, feature_id, JSON.stringify(context), response, logId],
      (err, results) => {
        if (err) {
          console.error("Error al actualizar el registro de uso:", err);
          return res
            .status(500)
            .json({ message: "Error al actualizar el registro de uso." });
        }
        if (results.affectedRows === 0) {
          return res
            .status(404)
            .json({ message: "Registro de uso no encontrado." });
        }
        res.json({ message: "Registro de uso actualizado exitosamente" });
      }
    );
  }
);

// Eliminar un registro de uso (solo administradores)
router.delete("/:id", authorize("admin"), (req, res) => {
  const logId = req.params.id;

  const query = "DELETE FROM usage_logs WHERE id = ?";
  connection.query(query, [logId], (err, results) => {
    if (err) {
      console.error("Error al eliminar el registro de uso:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar el registro de uso." });
    }
    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Registro de uso no encontrado." });
    }
    res.json({ message: "Registro de uso eliminado exitosamente" });
  });
});

module.exports = router;
