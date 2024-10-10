// models/usageLog.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UsageLog = sequelize.define(
    "UsageLog",
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
      feature_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      context: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      response: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      tableName: "usage_logs",
      timestamps: false,
    }
  );

  return UsageLog;
};
