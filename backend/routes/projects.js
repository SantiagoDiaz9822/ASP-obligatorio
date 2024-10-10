const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos
const auth = require("../middleware/auth"); // Middleware de autenticación
const authorize = require("../middleware/authorize"); // Middleware de autorización
const { body, validationResult } = require("express-validator"); // Para validaciones
const changeHistoryRouter = require("./changeHistory"); // Ruta de cambios

// Función para generar un API Key (implementación simple)
const generateApiKey = () => {
  return require("crypto").randomBytes(20).toString("hex"); // Genera una cadena aleatoria
};

// Rutas protegidas (usa el middleware de autenticación)
router.use(auth);

// Ruta para definir un nuevo proyecto (protegida)
router.post(
  "/new",
  [
    body("name").notEmpty().withMessage("El nombre del proyecto es requerido."),
    body("description").notEmpty().withMessage("La descripción es requerida."),
    body("company_id")
      .notEmpty()
      .withMessage("El ID de la empresa es requerido."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, company_id } = req.body;

    const query =
      "INSERT INTO projects (name, description, company_id) VALUES (?, ?, ?)";
    connection.query(query, [name, description, company_id], (err, results) => {
      if (err) {
        console.error("Error al crear el proyecto:", err);
        return res.status(500).json({ message: "Error al crear el proyecto." });
      }

      // Generar un token de autenticación (API Key)
      const apiKey = generateApiKey();

      // Actualizar el proyecto con el API Key
      const updateQuery = "UPDATE projects SET api_key = ? WHERE id = ?";
      connection.query(updateQuery, [apiKey, results.insertId], (err) => {
        if (err) {
          console.error("Error al asignar el API Key:", err);
          return res
            .status(500)
            .json({ message: "Error al asignar el API Key." });
        }

        // Registrar el cambio
        const action = "create"; // Acción realizada
        const changed_fields = { name, description, company_id, apiKey };
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
          message: "Proyecto creado exitosamente",
          projectId: results.insertId,
          apiKey,
        });
      });
    });
  }
);

// Leer todos los proyectos (solo administradores)
router.get("/", authorize("admin"), (req, res) => {
  const query = "SELECT * FROM projects";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los proyectos:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los proyectos." });
    }
    res.json(results);
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

// Actualizar un proyecto (solo administradores)
router.put(
  "/:id",
  authorize("admin"),
  [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("El nombre del proyecto no puede estar vacío."),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("La descripción no puede estar vacía."),
    body("api_key")
      .optional()
      .notEmpty()
      .withMessage("El API Key no puede estar vacío."),
  ],
  (req, res) => {
    const projectId = req.params.id;
    const { name, description, api_key } = req.body;

    const query =
      "UPDATE projects SET name = ?, description = ?, api_key = ? WHERE id = ?";
    connection.query(
      query,
      [name, description, api_key, projectId],
      (err, results) => {
        if (err) {
          console.error("Error al actualizar el proyecto:", err);
          return res
            .status(500)
            .json({ message: "Error al actualizar el proyecto." });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Proyecto no encontrado." });
        }

        // Registrar el cambio
        const action = "update"; // Acción realizada
        const changed_fields = { name, description, api_key };
        const changeQuery =
          "INSERT INTO change_history (feature_id, user_id, action, changed_fields) VALUES (?, ?, ?, ?)";
        connection.query(
          changeQuery,
          [projectId, req.userId, action, JSON.stringify(changed_fields)],
          (err) => {
            if (err) {
              console.error("Error al registrar el cambio:", err);
            }
          }
        );

        res.json({ message: "Proyecto actualizado exitosamente" });
      }
    );
  }
);

// Eliminar un proyecto (solo administradores)
router.delete("/:id", authorize("admin"), (req, res) => {
  const projectId = req.params.id;

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

    // Registrar el cambio
    const action = "delete"; // Acción realizada
    const changed_fields = { projectId };
    const changeQuery =
      "INSERT INTO change_history (feature_id, user_id, action, changed_fields) VALUES (?, ?, ?, ?)";
    connection.query(
      changeQuery,
      [projectId, req.userId, action, JSON.stringify(changed_fields)],
      (err) => {
        if (err) {
          console.error("Error al registrar el cambio:", err);
        }
      }
    );

    res.json({ message: "Proyecto eliminado exitosamente" });
  });
});

module.exports = router;
