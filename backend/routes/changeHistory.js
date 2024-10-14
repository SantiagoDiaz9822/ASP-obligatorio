const express = require("express");
const router = express.Router();
const connection = require("../db");
const auth = require("../middleware/auth");

// Rutas protegidas (usa el middleware)
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Change History
 *   description: API para gestionar el historial de cambios
 */

/**
 * @swagger
 * /change-history/new:
 *   post:
 *     summary: Registrar un nuevo cambio
 *     tags: [Change History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feature_id:
 *                 type: integer
 *                 description: ID de la característica
 *               action:
 *                 type: string
 *                 description: Acción realizada
 *               changed_fields:
 *                 type: object
 *                 description: Campos cambiados
 *     responses:
 *       201:
 *         description: Registro de cambio creado exitosamente
 *       400:
 *         description: Faltan campos requeridos
 *       500:
 *         description: Error al registrar el cambio
 */
router.post("/new", (req, res) => {
  const { feature_id, action, changed_fields } = req.body;
  const user_id = req.userId; // Obtiene el ID del usuario de la solicitud

  // Validar los campos requeridos
  if (!feature_id || !action) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  const query =
    "INSERT INTO change_history (feature_id, user_id, action, changed_fields) VALUES (?, ?, ?, ?)";
  connection.query(
    query,
    [feature_id, user_id, action, JSON.stringify(changed_fields)],
    (err, results) => {
      if (err) {
        console.error("Error al registrar el cambio:", err);
        return res
          .status(500)
          .json({ message: "Error al registrar el cambio." });
      }
      res.status(201).json({
        message: "Registro de cambio creado exitosamente",
        changeId: results.insertId,
      });
    }
  );
});

/**
 * @swagger
 * /change-history:
 *   get:
 *     summary: Leer todos los registros de cambios
 *     tags: [Change History]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           description: Fecha de inicio para filtrar los registros
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           description: Fecha de fin para filtrar los registros
 *       - in: query
 *         name: feature_key
 *         required: false
 *         schema:
 *           type: string
 *           description: Clave de la característica para filtrar
 *       - in: query
 *         name: user_id
 *         required: false
 *         schema:
 *           type: integer
 *           description: ID del usuario para filtrar
 *     responses:
 *       200:
 *         description: Lista de registros de cambios
 *       500:
 *         description: Error al obtener los registros de cambios
 */
router.get("/", (req, res) => {
  const { startDate, endDate, feature_key, user_id } = req.query;

  let query = "SELECT * FROM change_history WHERE 1=1";
  const params = [];

  if (startDate) {
    query += " AND created_at >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND created_at <= ?";
    params.push(endDate);
  }
  if (feature_key) {
    query +=
      " AND feature_id IN (SELECT id FROM features WHERE feature_key = ?)";
    params.push(feature_key);
  }
  if (user_id) {
    query += " AND user_id = ?";
    params.push(user_id);
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Error al obtener los registros de cambios:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los registros de cambios." });
    }
    res.json(results);
  });
});

/**
 * @swagger
 * /change-history/{id}:
 *   get:
 *     summary: Leer un registro de cambio por ID
 *     tags: [Change History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de cambio
 *     responses:
 *       200:
 *         description: Registro de cambio encontrado
 *       404:
 *         description: Registro de cambio no encontrado
 *       500:
 *         description: Error al obtener el registro de cambio
 */
router.get("/:id", (req, res) => {
  const changeId = req.params.id;

  const query = "SELECT * FROM change_history WHERE id = ?";
  connection.query(query, [changeId], (err, results) => {
    if (err) {
      console.error("Error al obtener el registro de cambio:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener el registro de cambio." });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Registro de cambio no encontrado." });
    }
    res.json(results[0]);
  });
});

/**
 * @swagger
 * /change-history/{id}:
 *   put:
 *     summary: Actualizar un registro de cambio
 *     tags: [Change History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de cambio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feature_id:
 *                 type: integer
 *                 description: ID de la característica
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario
 *               action:
 *                 type: string
 *                 description: Acción realizada
 *               changed_fields:
 *                 type: object
 *                 description: Campos cambiados
 *     responses:
 *       200:
 *         description: Registro de cambio actualizado exitosamente
 *       404:
 *         description: Registro de cambio no encontrado
 *       500:
 *         description: Error al actualizar el registro de cambio
 */
router.put("/:id", (req, res) => {
  const changeId = req.params.id;
  const { feature_id, user_id, action, changed_fields } = req.body;

  const query =
    "UPDATE change_history SET feature_id = ?, user_id = ?, action = ?, changed_fields = ? WHERE id = ?";
  connection.query(
    query,
    [feature_id, user_id, action, JSON.stringify(changed_fields), changeId],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar el registro de cambio:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar el registro de cambio." });
      }
      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Registro de cambio no encontrado." });
      }
      res.json({ message: "Registro de cambio actualizado exitosamente" });
    }
  );
});

/**
 * @swagger
 * /change-history/{id}:
 *   delete:
 *     summary: Eliminar un registro de cambio
 *     tags: [Change History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de cambio
 *     responses:
 *       200:
 *         description: Registro de cambio eliminado exitosamente
 *       404:
 *         description: Registro de cambio no encontrado
 *       500:
 *         description: Error al eliminar el registro de cambio
 */
router.delete("/:id", (req, res) => {
  const changeId = req.params.id;

  const query = "DELETE FROM change_history WHERE id = ?";
  connection.query(query, [changeId], (err, results) => {
    if (err) {
      console.error("Error al eliminar el registro de cambio:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar el registro de cambio." });
    }
    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Registro de cambio no encontrado." });
    }
    res.json({ message: "Registro de cambio eliminado exitosamente" });
  });
});

module.exports = router;
