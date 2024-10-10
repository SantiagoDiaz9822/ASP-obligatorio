// testData.js
const { sequelize, Company, User, Project, Feature } = require("./models");

const insertTestData = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos exitosa.");

    // Crear una empresa
    const company = await Company.create({
      name: "Masterson.com.uy",
      address: "Calle Falsa 123",
      logo_url: "https://s3.amazonaws.com/your-bucket/logo.png",
    });

    // Crear un usuario administrador
    const adminUser = await User.create({
      company_id: company.id,
      email: "admin@masterson.com.uy",
      password_hash: "hashedpassword123", // Asegúrate de usar un hash real
      role: "admin",
    });

    // Crear un proyecto
    const project = await Project.create({
      company_id: company.id,
      name: "Proyecto Principal",
      description: "Proyecto para gestionar las principales funcionalidades.",
      api_key: "unique-api-key-12345",
    });

    // Crear un feature
    const feature = await Feature.create({
      project_id: project.id,
      key: "use_new_sort_algorithm",
      description: "Usar el nuevo algoritmo de ordenamiento.",
      conditions: JSON.stringify([
        { campo: "country", operador: "equals", valor: "uy" },
        { campo: "age", operador: "greater", valor: "18" },
      ]),
      state: "on",
    });

    console.log("Datos de prueba insertados correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error insertando datos de prueba:", error);
    process.exit(1);
  }
};

insertTestData();
