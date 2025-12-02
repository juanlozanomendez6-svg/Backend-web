import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Venta from './venta.model.js';
import Producto from './producto.model.js';

const DetalleVenta = sequelize.define('DetalleVenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'ventas_detalle',
  timestamps: false
});

// Relaciones
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });

DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(DetalleVenta, { foreignKey: 'producto_id', as: 'ventas_detalle' });

export default DetalleVenta;
