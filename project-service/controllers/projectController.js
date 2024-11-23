require("dotenv").config();
const connection = require("../config/db");
const { generateApiKey } = require("../services/apiKeyGenerator");
const axios = require("axios"); // Asegúrate de tener axios instalado

// Crear un proyecto
const createProject = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.userId; // Tomamos el userId del token

  try {
    // Obtener el company_id desde el servicio de usuarios, usando el userId desde el token
    const userResponse = await axios.get(
      `${process.env.USER_SERVICE_URL}/${userId}/company`,
      {
        headers: {
          Authorization: `${req.headers["authorization"]}`, // Usamos el token desde la cabecera Authorization
        },
      }
    );
    const companyId = userResponse.data.company_id;

    const apiKey = generateApiKey();

    const query =
      "INSERT INTO projects (name, description, company_id, api_key) VALUES (?, ?, ?, ?)";
    connection.query(
      query,
      [name, description, companyId, apiKey],
      (err, results) => {
        if (err) {
          console.error("Error al crear el proyecto:", err);
          return res
            .status(500)
            .json({ message: "Error al crear el proyecto." });
        }

        // Registrar la creación del proyecto en el servicio de auditoría
        axios
          .post(`${process.env.AUDIT_SERVICE_URL}/log`, {
            action: "create",
            entity: "project",
            entityId: results.insertId,
            details: { name, description, companyId },
            userId: userId,
          })
          .then(() => {
            console.log("Auditoría registrada para la creación del proyecto.");
          })
          .catch((err) => {
            console.error("Error al registrar la auditoría:", err);
          });

        res.status(201).json({
          message: "Proyecto creado exitosamente",
          projectId: results.insertId,
          apiKey,
        });
      }
    );
  } catch (error) {
    console.error("Error al obtener el company_id del usuario:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener la empresa del usuario." });
  }
};

// Eliminar un proyecto
const deleteProject = (req, res) => {
  const projectId = req.params.id;
  const userId = req.userId;

  const query = "DELETE FROM projects WHERE id = ?";
  connection.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error al eliminar el proyecto:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar el proyecto." });
    }

    // Registrar la eliminación del proyecto en el servicio de auditoría
    axios
      .post(`${process.env.AUDIT_SERVICE_URL}/api/audit/log`, {
        action: "delete",
        entity: "project",
        entityId: projectId,
        details: { projectId },
        userId: userId,
      })
      .then(() => {
        console.log("Auditoría registrada para la eliminación del proyecto.");
      })
      .catch((err) => {
        console.error("Error al registrar la auditoría:", err);
      });

    res.json({ message: "Proyecto eliminado exitosamente" });
  });
};

// Leer todos los proyectos de la empresa
const getAllProjects = async (req, res) => {
  const userId = req.userId;

  try {
    // Obtener el company_id desde el servicio de usuarios
    const userResponse = await axios.get(
      `${process.env.USER_SERVICE_URL}/${userId}/company`,
      {
        headers: {
          Authorization: `${req.headers["authorization"]}`, // Usamos el token desde la cabecera Authorization
        },
      }
    );
    const companyId = userResponse.data.company_id;

    // Obtener todos los proyectos asociados a la empresa
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
  } catch (error) {
    console.error("Error al obtener el company_id del usuario:", error);
    return res.status(500).json({ message: "Error al obtener los proyectos." });
  }
};

// Leer un proyecto por ID
const getProjectById = (req, res) => {
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
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject,
};
