import ventaService from "../services/ventas.service.js";

const VentaController = {
  async getAll(req, res) {
    try {
      const filters = {
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        usuario_id: req.query.usuario_id,
      };

      const result = await ventaService.getAllVentas(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener ventas",
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await ventaService.getVentaById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener venta",
      });
    }
  },

  async create(req, res) {
    try {
      const ventaData = {
        ...req.body,
        // Si existe un usuario autenticado, usamos su id; si no, queda undefined
        usuario_id: req.user ? req.user.id : undefined,
      };

      const result = await ventaService.createVenta(ventaData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear venta",
      });
    }
  },

  async getReporte(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      // Permitir que el reporte funcione sin fechas
      const fechaInicio = fecha_inicio || "1900-01-01";
      const fechaFin = fecha_fin || "2100-12-31";

      const result = await ventaService.getVentasPorPeriodo(
        fechaInicio,
        fechaFin
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Error en getReporte:", error);
      res.status(500).json({
        success: false,
        message: "Error al generar reporte",
      });
    }
  },
};

export default VentaController;
