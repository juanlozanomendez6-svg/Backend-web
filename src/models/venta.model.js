import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Usuario from "./usuario.model.js";

const Venta = sequelize.define(
  "Venta",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
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

// Relaciones
Venta.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });
Usuario.hasMany(Venta, { foreignKey: "usuario_id", as: "ventas" });

export default Venta;
