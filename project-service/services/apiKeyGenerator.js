const crypto = require("crypto");

// Función para generar una API Key única
const generateApiKey = () => {
  return crypto.randomBytes(20).toString("hex");
};

module.exports = { generateApiKey };
