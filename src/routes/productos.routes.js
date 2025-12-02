// src/routes/productos.routes.ts
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import ProductoController from "../controllers/productos.controller.js";
import * as ProductoImagenController from "../controllers/productoImagen.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// ====== Configuración Multer para imágenes ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads"); // carpeta uploads en root
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Solo se permiten imágenes"));
    cb(null, true);
  },
});

// ================= Public routes =================
router.get("/", ProductoController.getAll);
router.get("/:id", ProductoController.getById);

// ================ Protected routes ================
router.use(authenticateToken);

router.post(
  "/",
  authorizeRoles("admin", "supervisor"),
  ProductoController.create
);
router.put(
  "/:id",
  authorizeRoles("admin", "supervisor"),
  ProductoController.update
);
router.patch(
  "/:id/stock",
  authorizeRoles("admin", "supervisor"),
  ProductoController.updateStock
);
router.delete("/:id", authorizeRoles("admin"), ProductoController.delete);

// ================ Imagen routes ================
router.get("/:productoId/imagenes", ProductoImagenController.listar);
router.get("/:productoId/imagenes/:id", ProductoImagenController.obtener);

router.post(
  "/:productoId/imagenes",
  authorizeRoles("admin", "supervisor"),
  upload.single("imagen"),
  ProductoImagenController.crear
);

router.put(
  "/:productoId/imagenes/:id",
  authorizeRoles("admin", "supervisor"),
  upload.single("imagen"),
  ProductoImagenController.actualizar
);

router.delete(
  "/:productoId/imagenes/:id",
  authorizeRoles("admin"),
  ProductoImagenController.eliminar
);

export default router;
