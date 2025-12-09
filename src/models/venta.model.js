import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Venta = sequelize.define(
  "Venta",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.STRING, // _id de MongoDB
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ventas",
    timestamps: false,
  }
);

// No hay relaciones con Usuario de Sequelize porque los usuarios están en MongoDB

export default Venta;
