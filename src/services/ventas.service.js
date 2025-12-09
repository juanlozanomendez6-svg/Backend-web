import { sequelize } from "../config/db.js";
import Venta from "../models/venta.model.js";
import DetalleVenta from "../models/detalle_venta.model.js";
import Producto from "../models/producto.model.js";
import Usuario from "../models/usuario.mongo.model.js"; // MongoDB
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

      if (filters.usuario_id) {
        whereClause.usuario_id = filters.usuario_id;
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

      // Traer usuarios desde MongoDB
      const usuarioIds = ventas.map((v) => v.usuario_id);
      const usuarios = await Usuario.find({ _id: { $in: usuarioIds } });

      const ventasConUsuario = ventas.map((v) => {
        const usuario = usuarios.find((u) => u._id.toString() === v.usuario_id);
        return {
          ...v.toJSON(),
          usuario: usuario
            ? {
                id: usuario._id.toString(),
                nombre: usuario.nombre,
                email: usuario.email,
              }
            : null,
        };
      });

      return { success: true, data: ventasConUsuario };
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

      // Buscar usuario en MongoDB
      const usuario = await Usuario.findById(venta.usuario_id);

      const ventaConUsuario = {
        ...venta.toJSON(),
        usuario: usuario
          ? {
              id: usuario._id.toString(),
              nombre: usuario.nombre,
              email: usuario.email,
            }
          : null,
      };

      return { success: true, data: ventaConUsuario };
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
      const { detalles, usuario_id } = ventaData;

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

      // Crear cabecera de la venta
      const venta = await Venta.create({ usuario_id, total }, { transaction });

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

      // Traer venta completa y usuario desde MongoDB
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

      const usuario = await Usuario.findById(usuario_id);

      return {
        success: true,
        data: {
          ...ventaCompleta.toJSON(),
          usuario: usuario
            ? {
                id: usuario._id.toString(),
                nombre: usuario.nombre,
                email: usuario.email,
              }
            : null,
        },
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

      // Buscar todos los usuarios de MongoDB
      const usuarioIds = ventas.map((v) => v.usuario_id);
      const usuarios = await Usuario.find({ _id: { $in: usuarioIds } });

      const ventasConUsuario = ventas.map((v) => {
        const usuario = usuarios.find((u) => u._id.toString() === v.usuario_id);
        return {
          ...v.toJSON(),
          usuario: usuario
            ? {
                id: usuario._id.toString(),
                nombre: usuario.nombre,
                email: usuario.email,
              }
            : null,
        };
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
          ventas: ventasConUsuario,
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
