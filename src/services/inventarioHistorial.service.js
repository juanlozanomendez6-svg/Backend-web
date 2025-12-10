// src/services/inventarioHistorial.service.js
import InventarioHistorial from "../models/inventario_historial.model.js";
import Producto from "../models/producto.model.js";
import logger from "../config/logger.js";
import { Op } from "sequelize";

class InventarioHistorialService {
  // Obtener historial de movimientos
  async getHistorial(filters = {}) {
    try {
      const whereClause = {};
      if (filters.producto_id) whereClause.producto_id = filters.producto_id;
      if (filters.fecha_inicio && filters.fecha_fin) {
        whereClause.fecha = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin],
        };
      }

      const movimientos = await InventarioHistorial.findAll({
        where: whereClause,
        include: [
          {
            model: Producto,
            as: "producto",
            attributes: ["id", "nombre", "stock"],
          },
        ],
        order: [["fecha", "DESC"]],
      });

      return {
        success: true,
        data: movimientos,
        message:
          movimientos.length === 0
            ? "No hay movimientos en el historial"
            : null,
      };
    } catch (error) {
      logger.error("Error en InventarioHistorialService.getHistorial:", error);
      return {
        success: false,
        data: [],
        message: "Error al obtener historial",
      };
    }
  }

  // Registrar movimiento de inventario
  async registrarMovimiento({ producto_id, cambio, motivo }) {
    try {
      // ✅ Solo usamos los campos existentes en la tabla
      const producto = await Producto.findByPk(producto_id);
      if (!producto) {
        return {
          success: false,
          data: null,
          message: "Producto no encontrado",
        };
      }

      // Validación de stock
      if (cambio < 0 && Math.abs(cambio) > producto.stock) {
        return { success: false, data: null, message: "Stock insuficiente" };
      }

      // Crear movimiento
      const movimiento = await InventarioHistorial.create({
        producto_id,
        cambio,
        motivo,
      });

      // Actualizar stock
      await producto.increment("stock", { by: cambio });

      return {
        success: true,
        data: movimiento,
        message: "Movimiento registrado exitosamente",
      };
    } catch (error) {
      logger.error(
        "Error en InventarioHistorialService.registrarMovimiento:",
        error
      );
      return {
        success: false,
        data: null,
        message: "Error al registrar movimiento",
      };
    }
  }

  // Productos con stock bajo
  async getStockBajo(umbral = 10) {
    try {
      const productos = await Producto.findAll({
        where: { stock: { [Op.lte]: umbral }, activo: true },
        include: ["categoria"],
        order: [["stock", "ASC"]],
      });

      return {
        success: true,
        data: productos,
        message:
          productos.length === 0 ? "No hay productos con stock bajo" : null,
      };
    } catch (error) {
      logger.error("Error en InventarioHistorialService.getStockBajo:", error);
      return {
        success: false,
        data: [],
        message: "Error al obtener productos con stock bajo",
      };
    }
  }

  // Estadísticas del inventario
  async getEstadisticasInventario() {
    try {
      const totalProductos = await Producto.count({ where: { activo: true } });
      const productosStockBajo = await Producto.count({
        where: { stock: { [Op.lte]: 10 }, activo: true },
      });
      const productosSinStock = await Producto.count({
        where: { stock: 0, activo: true },
      });
      const valorTotalInventario = await Producto.sum("precio", {
        where: { activo: true },
      });

      return {
        success: true,
        data: {
          totalProductos,
          productosStockBajo,
          productosSinStock,
          valorTotalInventario: valorTotalInventario || 0,
        },
      };
    } catch (error) {
      logger.error(
        "Error en InventarioHistorialService.getEstadisticasInventario:",
        error
      );
      return {
        success: false,
        data: {},
        message: "Error al obtener estadísticas",
      };
    }
  }
}

export default new InventarioHistorialService();
