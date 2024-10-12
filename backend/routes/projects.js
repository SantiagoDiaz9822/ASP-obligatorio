const express = require("express");
const router = express.Router();
const connection = require("../db"); // Conexión a la base de datos
const auth = require("../middleware/auth"); // Middleware de autenticación
const { body, validationResult } = require("express-validator"); // Para validaciones

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
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    const userId = req.userId; // Obtenemos el ID del usuario autenticado

    // Consulta para obtener el company_id del usuario autenticado
    const queryUser = "SELECT company_id FROM users WHERE id = ?";
    connection.query(queryUser, [userId], (err, userResults) => {
      if (err) {
        console.error("Error al obtener la empresa del usuario:", err);
        return res
          .status(500)
          .json({ message: "Error al obtener la empresa." });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const companyId = userResults[0].company_id;

      // Insertar el proyecto usando el company_id
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
  const userId = req.userId; // Obtén el ID del usuario autenticado

  // Obtener el ID de la empresa del usuario
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

    // Consultar proyectos filtrando por el ID de la empresa
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

// Eliminar un proyecto (solo si no tiene features)
router.delete("/:id", (req, res) => {
  const projectId = req.params.id;

  // Primero, verificar si el proyecto tiene features asociadas
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
