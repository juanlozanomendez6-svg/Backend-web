import { Op } from "sequelize";
import Producto from "../models/producto.model.js";
import Categoria from "../models/categoria.model.js";
import logger from "../config/logger.js";

class ProductoService {
  async getAllProductos(filters = {}) {
    try {
      const whereClause = { activo: true };

      if (filters.categoria_id) whereClause.categoria_id = filters.categoria_id;
      if (filters.search)
        whereClause.nombre = { [Op.iLike]: `%${filters.search}%` };

      const productos = await Producto.findAll({
        where: whereClause,
        include: [
          { model: Categoria, as: "categoria", attributes: ["id", "nombre"] },
        ],
        order: [["nombre", "ASC"]],
      });

      const productosMapeados = productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
        categoriaId: p.categoria_id,
        categoriaNombre: p.categoria ? p.categoria.nombre : "Sin categoría",
      }));

      return { success: true, data: productosMapeados };
    } catch (error) {
      logger.error("Error en ProductoService.getAllProductos:", error);
      return { success: false, message: "Error al obtener productos" };
    }
  }

  async getProductoById(id) {
    try {
      const producto = await Producto.findByPk(id, {
        include: [
          { model: Categoria, as: "categoria", attributes: ["id", "nombre"] },
        ],
      });
      if (!producto)
        return { success: false, message: "Producto no encontrado" };

      return {
        success: true,
        data: {
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          stock: producto.stock,
          categoriaId: producto.categoria_id,
          categoriaNombre: producto.categoria
            ? producto.categoria.nombre
            : "Sin categoría",
        },
      };
    } catch (error) {
      logger.error("Error en ProductoService.getProductoById:", error);
      return { success: false, message: "Error al obtener producto" };
    }
  }

  async createProducto(productoData) {
    try {
      // Mapear categoriaId → categoria_id
      const data = {
        ...productoData,
        categoria_id: productoData.categoriaId || null,
      };
      delete data.categoriaId;

      const producto = await Producto.create(data);
      const productoCompleto = await this.getProductoById(producto.id);
      return productoCompleto;
    } catch (error) {
      logger.error("Error en ProductoService.createProducto:", error);
      return { success: false, message: "Error al crear producto" };
    }
  }

  async updateProducto(id, productoData) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto)
        return { success: false, message: "Producto no encontrado" };

      // Mapear categoriaId → categoria_id
      const data = {
        ...productoData,
        categoria_id: productoData.categoriaId || null,
      };
      delete data.categoriaId;

      await producto.update(data);
      const productoActualizado = await this.getProductoById(id);
      return productoActualizado;
    } catch (error) {
      logger.error("Error en ProductoService.updateProducto:", error);
      return { success: false, message: "Error al actualizar producto" };
    }
  }

  async updateStock(id, cantidad) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto)
        return { success: false, message: "Producto no encontrado" };

      const nuevoStock = producto.stock + cantidad;
      if (nuevoStock < 0)
        return { success: false, message: "Stock insuficiente" };

      await producto.update({ stock: nuevoStock });
      return {
        success: true,
        data: { stock: nuevoStock },
        message: "Stock actualizado exitosamente",
      };
    } catch (error) {
      logger.error("Error en ProductoService.updateStock:", error);
      return { success: false, message: "Error al actualizar stock" };
    }
  }

  async deleteProducto(id) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto)
        return { success: false, message: "Producto no encontrado" };

      await producto.update({ activo: false });
      return { success: true, message: "Producto desactivado exitosamente" };
    } catch (error) {
      logger.error("Error en ProductoService.deleteProducto:", error);
      return { success: false, message: "Error al desactivar producto" };
    }
  }
}

export default new ProductoService();
