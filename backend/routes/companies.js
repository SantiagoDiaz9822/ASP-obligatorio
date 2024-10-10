const express = require("express");
const router = express.Router();
const connection = require("../db"); // Asegúrate de tener la conexión configurada en db.js
const auth = require("../middleware/auth"); // Importa el middleware

// Rutas protegidas (usa el middleware)
router.use(auth);

router.post("/new", auth, authorize("admin"), (req, res) => {
  const { name, address, logo_url, users } = req.body; // Asumiendo que también se reciben usuarios

  const query =
    "INSERT INTO companies (name, address, logo_url) VALUES (?, ?, ?)";
  connection.query(query, [name, address, logo_url], (err, results) => {
    if (err) {
      console.error("Error al crear la empresa:", err);
      return res.status(500).json({ message: "Error al crear la empresa." });
    }

    const companyId = results.insertId;

    // Crear usuarios asociados
    if (users && users.length > 0) {
      users.forEach((user) => {
        const { email, password, role } = user;
        // Hashear la contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);
        const userQuery =
          "INSERT INTO users (company_id, email, password_hash, role) VALUES (?, ?, ?, ?)";

        connection.query(
          userQuery,
          [companyId, email, hashedPassword, role],
          (err) => {
            if (err) {
              console.error("Error al crear el usuario:", err);
            }
          }
        );
      });
    }

    res.status(201).json({ message: "Empresa creada exitosamente", companyId });
  });
});

// Leer todas las empresas
router.get("/", (req, res) => {
  const query = "SELECT * FROM companies";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener las empresas:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener las empresas." });
    }
    res.json(results);
  });
});

// Leer una empresa por ID
router.get("/:id", (req, res) => {
  const companyId = req.params.id;

  const query = "SELECT * FROM companies WHERE id = ?";
  connection.query(query, [companyId], (err, results) => {
    if (err) {
      console.error("Error al obtener la empresa:", err);
      return res.status(500).json({ message: "Error al obtener la empresa." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada." });
    }
    res.json(results[0]);
  });
});

// Actualizar una empresa
router.put("/:id", (req, res) => {
  const companyId = req.params.id;
  const { name, address, logo_url } = req.body;

  const query =
    "UPDATE companies SET name = ?, address = ?, logo_url = ? WHERE id = ?";
  connection.query(
    query,
    [name, address, logo_url, companyId],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar la empresa:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar la empresa." });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Empresa no encontrada." });
      }
      res.json({ message: "Empresa actualizada exitosamente" });
    }
  );
});

// Eliminar una empresa
router.delete("/:id", (req, res) => {
  const companyId = req.params.id;

  const query = "DELETE FROM companies WHERE id = ?";
  connection.query(query, [companyId], (err, results) => {
    if (err) {
      console.error("Error al eliminar la empresa:", err);
      return res.status(500).json({ message: "Error al eliminar la empresa." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Empresa no encontrada." });
    }
    res.json({ message: "Empresa eliminada exitosamente" });
  });
});

module.exports = router;
