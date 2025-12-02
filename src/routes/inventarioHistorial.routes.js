// src/routes/inventario.routes.js
import express from "express";
import InventarioHistorialController from "../controllers/inventarioHistorial.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import Producto from "../models/producto.model.js"; // importar modelo Producto

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Endpoint para obtener TODOS los productos con su stock
router.get("/", authorizeRoles(["admin", "supervisor"]), async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { activo: true },
      attributes: ["id", "nombre", "stock"],
      order: [["nombre", "ASC"]],
    });
    res.json(productos); // devuelve array de productos
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
    });
  }
});

// Rutas existentes
router.get(
  "/historial",
  authorizeRoles(["admin", "supervisor"]),
  // Middleware para desactivar cache
  (req, res, next) => {
    res.set("Cache-Control", "no-store"); // evita 304
    next();
  },
  InventarioHistorialController.getHistorial
);

router.get(
  "/stock-bajo",
  authorizeRoles(["admin", "supervisor"]),
  InventarioHistorialController.getStockBajo
);

router.get(
  "/estadisticas",
  authorizeRoles(["admin", "supervisor"]),
  InventarioHistorialController.getEstadisticas
);

router.post(
  "/movimiento",
  authorizeRoles(["admin", "supervisor", "cajero"]),
  InventarioHistorialController.registrarMovimiento
);

export default router;
