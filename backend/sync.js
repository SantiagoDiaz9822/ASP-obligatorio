// sync.js
const { sequelize } = require("./models");

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos exitosa.");

    // Sincronizar todos los modelos
    await sequelize.sync({ alter: true });
    console.log("Sincronización completada.");

    process.exit(0);
  } catch (error) {
    console.error("Error sincronizando la base de datos:", error);
    process.exit(1);
  }
};

syncDatabase();
