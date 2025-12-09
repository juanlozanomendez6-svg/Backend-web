// src/controllers/inventarioHistorial.controller.js
import inventarioHistorialService from "../services/inventarioHistorial.service.js";

const InventarioHistorialController = {
  // Obtener historial de movimientos de inventario (opcionalmente filtrado por producto y fechas)
  async getHistorial(req, res) {
    try {
      const filters = {
        producto_id: req.query.producto_id,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
      };

      const result = await inventarioHistorialService.getHistorial(filters);

      res.json({
        success: result.success,
        data: Array.isArray(result.data) ? result.data : [],
        message: result.message || null,
      });
    } catch (error) {
      console.error(
        "Error en InventarioHistorialController.getHistorial:",
        error
      );
      res.status(500).json({
        success: false,
        data: [],
        message: "Error al obtener historial",
      });
    }
  },

  // Registrar un movimiento de inventario
  async registrarMovimiento(req, res) {
    try {
      // Solo enviamos los campos que realmente existen en la tabla
      const movimientoData = { ...req.body };

      const result = await inventarioHistorialService.registrarMovimiento(
        movimientoData
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error(
        "Error en InventarioHistorialController.registrarMovimiento:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error al registrar movimiento",
      });
    }
  },

  // Obtener productos con stock bajo
  async getStockBajo(req, res) {
    try {
      const umbral = parseInt(req.query.umbral) || 10;
      const result = await inventarioHistorialService.getStockBajo(umbral);
      res.json(result);
    } catch (error) {
      console.error(
        "Error en InventarioHistorialController.getStockBajo:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error al obtener productos con stock bajo",
      });
    }
  },

  // Obtener estadísticas del inventario
  async getEstadisticas(req, res) {
    try {
      const result =
        await inventarioHistorialService.getEstadisticasInventario();
      res.json(result);
    } catch (error) {
      console.error(
        "Error en InventarioHistorialController.getEstadisticas:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error al obtener estadísticas",
      });
    }
  },
};

export default InventarioHistorialController;
