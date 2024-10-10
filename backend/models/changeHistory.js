// models/changeHistory.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ChangeHistory = sequelize.define(
    "ChangeHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      feature_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      action: {
        type: DataTypes.ENUM("create", "update", "delete"),
        allowNull: false,
      },
      changed_fields: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "change_history",
      timestamps: false,
    }
  );

  return ChangeHistory;
};
