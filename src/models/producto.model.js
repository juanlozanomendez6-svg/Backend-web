import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Categoria from './categoria.model.js';

const Producto = sequelize.define('Producto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(120), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false },
  categoria_id: { type: DataTypes.INTEGER, allowNull: true },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'productos',
  timestamps: false
});

// Relaciones
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });

export default Producto;
