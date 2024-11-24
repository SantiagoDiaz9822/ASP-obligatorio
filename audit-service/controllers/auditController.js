const db = require("../config/db");
require("dotenv").config();
const axios = require("axios");
const transporter = require("../services/mailer");

// Función para obtener el companyId de un usuario
async function getCompanyIdForUser(userId) {
  try {
    const userResponse = await axios.get(
      `${process.env.USER_SERVICE_URL}/${userId}/company`
    );
    const companyId = userResponse.data.company_id;
    return companyId;
  } catch (error) {
    console.error("Error obteniendo el companyId", error);
    return null;
  }
}

// Función para enviar correo de notificación
async function sendEmailNotification(companyId, featureName, values) {
  // Obtener los usuarios suscritos a la empresa
  const users = await getUsersByCompanyId(companyId); // Función para obtener los usuarios suscritos
  const subscribedUsers = users.filter((user) => user.is_subscribed); // Filtramos los suscritos

  // Enviar correos a los usuarios suscritos
  for (const user of subscribedUsers) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Notificación de actualización en feature: ${featureName}`,
      text: `Hola ${user.first_name},\n\nLa feature "${featureName}" ha sido actualizada.\n "${values}" \n Te mantenemos informado.\n\nSaludos,\nTu equipo.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo:", error);
      } else {
        console.log("Correo enviado:", info.response);
      }
    });
  }
}

// Función para obtener los usuarios suscritos a una empresa
async function getUsersByCompanyId(companyId) {
  try {
    // Hacer la solicitud GET al microservicio de usuarios
    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/${companyId}/users`
    );
    console.log("Usuarios de la empresa:", response.data);
    // Si la respuesta es exitosa, retornar los datos de los usuarios
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios de la empresa:", error);

    // Si hay error en la llamada, lanzar un error para manejarlo en el controlador
    throw new Error("No se pudieron obtener los usuarios de la empresa.");
  }
}

// Función para registrar una acción de auditoría con promesas (usando async/await)
async function logAuditAction(action, entity, entityId, details, userId) {
  const timestamp = new Date().toISOString(); // Fecha y hora actual

  const auditRecord = {
    action,
    entity,
    entity_id: entityId,
    details: JSON.stringify(details),
    user_id: userId,
    timestamp,
  };

  const query =
    "INSERT INTO audit_log (action, entity, entity_id, details, user_id, timestamp) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [
    auditRecord.action,
    auditRecord.entity,
    auditRecord.entity_id,
    auditRecord.details,
    auditRecord.user_id,
    auditRecord.timestamp,
  ];

  try {
    const [result] = await db.promise().execute(query, values);

    // Si la entidad es 'feature', enviamos la notificación
    if (auditRecord.entity === "feature") {
      // Obtener el companyId del usuario
      const companyId = await getCompanyIdForUser(auditRecord.user_id);
      try {
        // Enviar la notificación a todos los usuarios suscritos
        await sendEmailNotification(companyId, auditRecord.entity_id, values);
      } catch (error) {
        console.error("Error enviando notificación por correo:", error);
      }
    }
  } catch (err) {
    console.error("Error al registrar la auditoría:", err);
  }
}

// Función para obtener los registros de auditoría con filtros usando async/await
async function getAuditLogs(filters) {
  let queryBase = "SELECT * FROM audit_log WHERE 1 = 1"; // Iniciar consulta con filtro de todas las entradas
  const queryValues = [];

  // Agregar filtros
  if (filters.startDate && filters.endDate) {
    queryBase += " AND timestamp BETWEEN ? AND ?";
    queryValues.push(filters.startDate, filters.endDate);
  }

  if (filters.action) {
    queryBase += " AND action = ?";
    queryValues.push(filters.action);
  }

  if (filters.userId) {
    queryBase += " AND user_id = ?";
    queryValues.push(filters.userId);
  }

  try {
    const [rows] = await db.promise().execute(queryBase, queryValues);
    return rows; // Retorna los registros obtenidos
  } catch (err) {
    console.error("Error al obtener los registros de auditoría:", err);
    throw new Error("Error al obtener los registros de auditoría");
  }
}

module.exports = { logAuditAction, getAuditLogs };
