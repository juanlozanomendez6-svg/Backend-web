import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

// Rutas
import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuarios.routes.js";
import productoRoutes from "./routes/productos.routes.js";
import categoriaRoutes from "./routes/categorias.routes.js";
import ventaRoutes from "./routes/ventas.routes.js";
import inventarioHistorialRoutes from "./routes/inventarioHistorial.routes.js";
import rolRoutes from "./routes/roles.routes.js";

// Middlewares
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

// Obtener __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar app
const app = express();

// 📌 Rate limiting (seguridad)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Demasiadas solicitudes desde esta IP" },
});

// 📌 Middlewares globales
app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Frontend Web
      "http://localhost:19006", // Expo Mobile
    ],
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 📌 SERVIR IMÁGENES DESDE /uploads
// Si tienes C:\Users\marti\OneDrive\Escritorio\backend-web\uploads
// entonces las imágenes serán accesibles en:
// http://localhost:4000/uploads/nombreImagen.jpg
// 📌 SERVIR IMÁGENES DESDE /uploads
app.use("/uploads", cors(), express.static(path.join(__dirname, "../uploads")));

// 📌 Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Servidor POS funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 📌 RUTAS API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/inventario", inventarioHistorialRoutes);
app.use("/api/roles", rolRoutes);

// 📌 Middlewares de errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
