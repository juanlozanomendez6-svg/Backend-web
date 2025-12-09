// src/models/inventarioHistorial.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Producto from "./producto.model.js";

const InventarioHistorial = sequelize.define(
  "InventarioHistorial",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Producto,
        key: "id",
      },
    },
    cambio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING(200),
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "inventario_historial",
    timestamps: false,
  }
);

// Relaciones solo con Producto
Producto.hasMany(InventarioHistorial, {
  foreignKey: "producto_id",
  as: "historial",
});
InventarioHistorial.belongsTo(Producto, {
  foreignKey: "producto_id",
  as: "producto",
});

export default InventarioHistorial;
