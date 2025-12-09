import { sequelize } from "../config/db.js";
import Venta from "../models/venta.model.js";
import DetalleVenta from "../models/detalle_venta.model.js";
import Producto from "../models/producto.model.js";
import logger from "../config/logger.js";
import { Op } from "sequelize";

class VentaService {
  // ================================================================
  // OBTENER TODAS LAS VENTAS (con filtros)
  // ================================================================
  async getAllVentas(filters = {}) {
    try {
      const whereClause = {};

      if (filters.fecha_inicio && filters.fecha_fin) {
        whereClause.fecha = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin],
        };
      }

      const ventas = await Venta.findAll({
        where: whereClause,
        include: [
          {
            model: DetalleVenta,
            as: "detalles",
            include: [
              {
                model: Producto,
                as: "producto",
                attributes: ["id", "nombre", "precio"],
              },
            ],
          },
        ],
        order: [["fecha", "DESC"]],
      });

      return { success: true, data: ventas };
    } catch (error) {
      logger.error("Error en VentaService.getAllVentas:", error);
      return { success: false, message: "Error al obtener ventas" };
    }
  }

  // ================================================================
  // OBTENER UNA VENTA POR ID
  // ================================================================
  async getVentaById(id) {
    try {
      const venta = await Venta.findByPk(id, {
        include: [
          {
            model: DetalleVenta,
            as: "detalles",
            include: [
              {
                model: Producto,
                as: "producto",
                attributes: ["id", "nombre", "precio"],
              },
            ],
          },
        ],
      });

      if (!venta) return { success: false, message: "Venta no encontrada" };

      return { success: true, data: venta };
    } catch (error) {
      logger.error("Error en VentaService.getVentaById:", error);
      return { success: false, message: "Error al obtener venta" };
    }
  }

  // ================================================================
  // CREAR VENTA
  // ================================================================
  async createVenta(ventaData) {
    const transaction = await sequelize.transaction();

    try {
      const { detalles } = ventaData;

      if (!detalles || detalles.length === 0) {
        throw new Error("La venta debe tener al menos un producto");
      }

      let total = 0;

      // Validar productos + calcular totales
      for (const detalle of detalles) {
        const producto = await Producto.findByPk(detalle.producto_id);

        if (!producto)
          throw new Error(`Producto ${detalle.producto_id} no encontrado`);

        if (producto.stock < detalle.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}`);
        }

        detalle.precio = producto.precio;
        detalle.subtotal = producto.precio * detalle.cantidad;
        total += detalle.subtotal;
      }

      // Crear cabecera de la venta sin usuario
      const venta = await Venta.create({ total }, { transaction });

      // Insertar detalles y descontar stock
      for (const detalle of detalles) {
        await DetalleVenta.create(
          {
            venta_id: venta.id,
            producto_id: detalle.producto_id,
            cantidad: detalle.cantidad,
            precio: detalle.precio,
            subtotal: detalle.subtotal,
          },
          { transaction }
        );

        await Producto.decrement(
          { stock: detalle.cantidad },
          { where: { id: detalle.producto_id }, transaction }
        );
      }

      await transaction.commit();

      // Traer venta completa
      const ventaCompleta = await Venta.findByPk(venta.id, {
        include: [
          {
            model: DetalleVenta,
            as: "detalles",
            include: [
              {
                model: Producto,
                as: "producto",
                attributes: ["id", "nombre", "precio"],
              },
            ],
          },
        ],
      });

      return {
        success: true,
        data: ventaCompleta,
        message: "Venta registrada exitosamente",
      };
    } catch (error) {
      await transaction.rollback();
      logger.error("Error en VentaService.createVenta:", error);
      return {
        success: false,
        message: error.message || "Error al crear venta",
      };
    }
  }

  // ================================================================
  // REPORTE DE VENTAS POR PERIODO
  // ================================================================
  async getVentasPorPeriodo(fechaInicio, fechaFin) {
    try {
      const ventas = await Venta.findAll({
        where: { fecha: { [Op.between]: [fechaInicio, fechaFin] } },
        include: [
          {
            model: DetalleVenta,
            as: "detalles",
            include: [
              { model: Producto, as: "producto", attributes: ["nombre"] },
            ],
          },
        ],
        order: [["fecha", "ASC"]],
      });

      const totalVentas = ventas.length;
      const totalIngresos = ventas.reduce(
        (sum, venta) => sum + parseFloat(venta.total),
        0
      );
      const promedioVenta = totalVentas ? totalIngresos / totalVentas : 0;

      return {
        success: true,
        data: {
          ventas,
          estadisticas: {
            totalVentas,
            totalIngresos,
            promedioVenta: Math.round(promedioVenta * 100) / 100,
          },
        },
      };
    } catch (error) {
      logger.error("Error en VentaService.getVentasPorPeriodo:", error);
      return { success: false, message: "Error al obtener reporte de ventas" };
    }
  }
}

export default new VentaService();
