// src/server.js
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import app from "./app.js";
import { testConnection, sequelize, syncModels } from "./config/db.js";
import logger from "./config/logger.js";

// Para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render asigna dinámicamente el puerto
const PORT = process.env.PORT || 3000;

const initializeDatabase = async () => {
  try {
    const connected = await testConnection();
    if (!connected) throw new Error("No se pudo conectar a la base de datos");

    // Solo sincronizar modelos en desarrollo
    if (process.env.NODE_ENV === "development") {
      await syncModels(false);
    }

    // Ejecutar seed opcionalmente
    try {
      const seedPath = path.join(__dirname, "../scripts/seed.js");
      const { default: seedDatabase } = await import(
        pathToFileURL(seedPath).href
      );
      await seedDatabase();
      logger.info("✅ Seed ejecutado correctamente");
    } catch (seedError) {
      logger.warn(
        "⚠️ No se pudo ejecutar seed, continuar sin seed:",
        seedError.message
      );
    }

    return true;
  } catch (error) {
    logger.error("❌ Error inicializando base de datos:", error);
    return false;
  }
};

const startServer = async () => {
  try {
    logger.info("🚀 Iniciando servidor POS...");

    const dbInitialized = await initializeDatabase();
    if (!dbInitialized)
      throw new Error("Falló la inicialización de la base de datos");

    // Escuchar en el puerto asignado por Render
    app.listen(PORT, () => {
      logger.info(`✅ Servidor ejecutándose en puerto ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 URL: http://localhost:${PORT} (local)`);
      logger.info(`🔍 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("❌ Error iniciando servidor:", error);
    process.exit(1);
  }
};

// Cierre graceful
process.on("SIGINT", async () => {
  await sequelize.close();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await sequelize.close();
  process.exit(0);
});

// Manejo de errores globales
process.on("unhandledRejection", (reason, promise) =>
  logger.error("❌ Unhandled Rejection:", promise, "reason:", reason)
);
process.on("uncaughtException", (error) => {
  logger.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Iniciar servidor
startServer();
