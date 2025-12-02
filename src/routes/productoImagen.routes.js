// src/routes/productoImagen.routes.ts
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import * as ProductoImagenController from "../controllers/productoImagen.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true }); // mergeParams para tener productoId

// ====== Configuración Multer ======
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

// ================== Rutas ==================

// Public: listar todas las imágenes de un producto
router.get("/", ProductoImagenController.listar);
router.get("/:id", ProductoImagenController.obtener);

// Protected: requieren autenticación
router.use(authenticateToken);

router.post(
  "/",
  authorizeRoles("admin", "supervisor"),
  upload.single("imagen"),
  ProductoImagenController.crear
);

router.put(
  "/:id",
  authorizeRoles("admin", "supervisor"),
  upload.single("imagen"),
  ProductoImagenController.actualizar
);

router.delete(
  "/:id",
  authorizeRoles("admin"),
  ProductoImagenController.eliminar
);

export default router;
