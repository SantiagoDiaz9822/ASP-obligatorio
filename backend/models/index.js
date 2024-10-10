// models/index.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Desactiva los logs de SQL en la consola
  }
);

// Importar los modelos
const Company = require("./company")(sequelize);
const User = require("./user")(sequelize);
const Project = require("./project")(sequelize);
const Feature = require("./feature")(sequelize);
const ChangeHistory = require("./changeHistory")(sequelize);
const UsageLog = require("./usageLog")(sequelize);

// Definir las relaciones
Company.hasMany(User, { foreignKey: "company_id", onDelete: "CASCADE" });
User.belongsTo(Company, { foreignKey: "company_id" });

Company.hasMany(Project, { foreignKey: "company_id", onDelete: "CASCADE" });
Project.belongsTo(Company, { foreignKey: "company_id" });

Project.hasMany(Feature, { foreignKey: "project_id", onDelete: "CASCADE" });
Feature.belongsTo(Project, { foreignKey: "project_id" });

Feature.hasMany(ChangeHistory, {
  foreignKey: "feature_id",
  onDelete: "CASCADE",
});
ChangeHistory.belongsTo(Feature, { foreignKey: "feature_id" });

User.hasMany(ChangeHistory, { foreignKey: "user_id", onDelete: "SET NULL" });
ChangeHistory.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(UsageLog, { foreignKey: "project_id", onDelete: "CASCADE" });
UsageLog.belongsTo(Project, { foreignKey: "project_id" });

Feature.hasMany(UsageLog, { foreignKey: "feature_id", onDelete: "CASCADE" });
UsageLog.belongsTo(Feature, { foreignKey: "feature_id" });

module.exports = {
  sequelize,
  Company,
  User,
  Project,
  Feature,
  ChangeHistory,
  UsageLog,
};
