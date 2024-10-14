const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const connection = require("../db");

// Endpoint para verificar la salud del sistema
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar la salud del sistema
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: El servicio está funcionando correctamente
 *       500:
 *         description: Error al conectar con la base de datos o error inesperado
 */
router.get("/", async (req, res) => {
  try {
    // Verifica la conexión a la base de datos
    connection.query("SELECT 1", (error, results) => {
      if (error) {
        console.error("Error connecting to the database:", error);
        return res
          .status(500)
          .json({ status: "fail", message: "Database connection failed" });
      }

      // Aquí puedes agregar más chequeos, como conectividad a otros servicios

      res
        .status(200)
        .json({ status: "success", message: "Service is up and running" });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res
      .status(500)
      .json({ status: "fail", message: "Unexpected error occurred" });
  }
});

module.exports = router;
