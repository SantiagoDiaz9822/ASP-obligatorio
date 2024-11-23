const dynamoDb = require("../config/db");
const { validationResult } = require("express-validator");
const uuid = require("uuid");

// Registrar una nueva acción en el historial de auditoría
const createAuditRecord = async (req, res) => {
  const { action, entity, entityId, details, userId } = req.body;

  // Validación de los datos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const auditId = uuid.v4(); // Generamos un ID único para el registro

  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: {
      id: auditId, // Usamos el UUID como el ID del registro
      action: action,
      entity: entity, // Entidad (project, user, etc.)
      entityId: entityId, // El ID de la entidad afectada
      details: JSON.stringify(details), // Detalles como JSON string
      userId: userId, // ID del usuario que realizó la acción
      timestamp: new Date().toISOString(),
    },
  };

  try {
    // Guardar en DynamoDB
    await dynamoDb.put(params).promise();
    res.status(201).json({
      message: "Acción registrada exitosamente en el historial de auditoría.",
      auditId: auditId,
    });
  } catch (err) {
    console.error("Error al registrar la acción de auditoría:", err);
    return res.status(500).json({ message: "Error al registrar la acción." });
  }
};

// Leer todos los registros de auditoría
const getAllAuditLogs = async (req, res) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    console.error("Error al obtener los registros de auditoría:", err);
    return res.status(500).json({ message: "Error al obtener los registros." });
  }
};

// Leer un registro de auditoría por ID
const getAuditLogById = async (req, res) => {
  const auditId = req.params.id;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      id: auditId, // Buscamos por ID
    },
  };

  try {
    const data = await dynamoDb.get(params).promise();
    if (!data.Item) {
      return res
        .status(404)
        .json({ message: "Registro de auditoría no encontrado." });
    }
    res.json(data.Item);
  } catch (err) {
    console.error("Error al obtener el registro de auditoría:", err);
    return res.status(500).json({ message: "Error al obtener el registro." });
  }
};

module.exports = { createAuditRecord, getAllAuditLogs, getAuditLogById };
