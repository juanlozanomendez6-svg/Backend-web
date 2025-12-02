import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ProductoImagen = sequelize.define(
  "ProductoImagen",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    creado_en: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "producto_imagen",
    timestamps: false,
  }
);

export default ProductoImagen;
