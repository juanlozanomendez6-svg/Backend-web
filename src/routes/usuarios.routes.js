import express from "express";
import UsuarioController from "../controllers/usuarios.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Rutas públicas
router.post("/login", UsuarioController.login);
router.post("/register", UsuarioController.register);

// Middleware para proteger rutas
router.use(authenticateToken);

// Rutas protegidas
router.get("/", authorizeRoles(["admin"]), UsuarioController.getAll);
router.get(
  "/:id",
  authorizeRoles(["admin", "supervisor"], true),
  UsuarioController.getById
);
router.put("/:id", authorizeRoles(["admin"], true), UsuarioController.update);

// Soft delete (desactivar usuario)
router.delete("/:id", authorizeRoles(["admin"]), UsuarioController.delete);

// Hard delete (eliminar permanentemente)
// Puedes usar un endpoint diferente para que quede claro que es irreversible
router.delete(
  "/hard/:id",
  authorizeRoles(["admin"]),
  UsuarioController.hardDelete
);

// Crear usuario (solo admin)
router.post("/", authorizeRoles(["admin"]), UsuarioController.create);

export default router;
