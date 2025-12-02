import express from "express";
import VentaController from "../controllers/ventas.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Rutas protegidas
router.get("/", authenticateToken, VentaController.getAll);

router.get(
  "/reporte",
  authenticateToken,
  authorizeRoles(["admin", "supervisor", "cajero"]), // <-- array de roles
  VentaController.getReporte
);

router.get("/:id", authenticateToken, VentaController.getById);

router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin", "supervisor", "cajero"]), // <-- array de roles
  VentaController.create
);

// Exportar router
export default router;
