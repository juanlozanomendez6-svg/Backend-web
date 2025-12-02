// src/controllers/productos.controller.js
import productoService from "../services/productos.service.js";

const ProductoController = {
  // Obtener todos los productos con filtros opcionales
  async getAll(req, res) {
    try {
      const filters = {
        categoria_id: req.query.categoria_id,
        search: req.query.search,
      };

      const result = await productoService.getAllProductos(filters);
      res.json(result);
    } catch (error) {
      console.error("Error en ProductoController.getAll:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos",
      });
    }
  },

  // Obtener producto por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await productoService.getProductoById(id);

      if (!result.success) return res.status(404).json(result);

      res.json(result);
    } catch (error) {
      console.error("Error en ProductoController.getById:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener producto",
      });
    }
  },

  // Crear un nuevo producto
  async create(req, res) {
    try {
      const result = await productoService.createProducto(req.body);

      if (!result.success) return res.status(400).json(result);

      res.status(201).json(result);
    } catch (error) {
      console.error("Error en ProductoController.create:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear producto",
      });
    }
  },

  // Actualizar un producto existente
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await productoService.updateProducto(id, req.body);

      if (!result.success) return res.status(400).json(result);

      res.json(result);
    } catch (error) {
      console.error("Error en ProductoController.update:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar producto",
      });
    }
  },

  // Actualizar el stock de un producto
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;

      if (typeof cantidad !== "number") {
        return res.status(400).json({
          success: false,
          message: "Cantidad debe ser un número",
        });
      }

      const result = await productoService.updateStock(id, cantidad);

      if (!result.success) return res.status(400).json(result);

      res.json(result);
    } catch (error) {
      console.error("Error en ProductoController.updateStock:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar stock",
      });
    }
  },

  // Desactivar (eliminar) un producto
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await productoService.deleteProducto(id);

      if (!result.success) return res.status(400).json(result);

      res.json(result);
    } catch (error) {
      console.error("Error en ProductoController.delete:", error);
      res.status(500).json({
        success: false,
        message: "Error al desactivar producto",
      });
    }
  },
};

export default ProductoController;
