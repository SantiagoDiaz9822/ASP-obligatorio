// models/feature.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Feature = sequelize.define(
    "Feature",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isAlphanumeric: true,
          notContains: " ",
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      conditions: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      state: {
        type: DataTypes.ENUM("on", "off"),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "features",
      timestamps: false,
    }
  );

  return Feature;
};
