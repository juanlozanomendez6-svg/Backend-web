// src/server.js
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import app from "./app.js";

// PostgreSQL
import { testConnection, sequelize, syncModels } from "./config/db.js";

// MongoDB
import { connectMongo } from "./config/mongo.js";

import logger from "./config/logger.js";

// Para usar __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render asigna dinámicamente el puerto
const PORT = process.env.PORT || 3000;

/* ================================
       INICIALIZACIÓN MONGO
================================ */
const initializeMongo = async () => {
  try {
    await connectMongo();
    logger.info("🍃 MongoDB conectado correctamente");
  } catch (error) {
    logger.error(`❌ Error conectando a MongoDB: ${error.message}`);
    throw error;
  }
};

/* ================================
   INICIALIZACIÓN POSTGRES / SEQUELIZE
================================ */
const initializePostgres = async () => {
  try {
    const connected = await testConnection();

    if (!connected) throw new Error("❌ Error conectando a PostgreSQL");

    // Solo sincronizar en desarrollo
    if (process.env.NODE_ENV === "development") {
      await syncModels(false);
    }

    // Ejecutar seed (opcional)
    try {
      const seedPath = path.join(__dirname, "../scripts/seed.js");
      const { default: seedDatabase } = await import(
        pathToFileURL(seedPath).href
      );
      await seedDatabase();
      logger.info("🌱 Seed ejecutado correctamente");
    } catch (seedError) {
      logger.warn(`⚠️ Seed no ejecutado: ${seedError.message}`);
    }

    logger.info("🐘 PostgreSQL listo");
    return true;
  } catch (error) {
    logger.error(`❌ Error inicializando PostgreSQL: ${error.message}`);
    return false;
  }
};

/* ================================
            START SERVER
================================ */
const startServer = async () => {
  try {
    logger.info("🚀 Iniciando servidor POS...");

    // 1️⃣ Conectar MongoDB
    await initializeMongo();

    // 2️⃣ Inicializar PostgreSQL
    const dbInitialized = await initializePostgres();
    if (!dbInitialized) throw new Error("Falló la inicialización de Postgres");

    // 3️⃣ Escuchar puerto
    app.listen(PORT, () => {
      logger.info(`✅ Servidor corriendo en puerto ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔍 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error(`❌ Error iniciar servidor: ${error.message}`);
    process.exit(1);
  }
};

/* ================================
        GRACEFUL SHUTDOWN
================================ */
process.on("SIGINT", async () => {
  await sequelize.close();
  logger.warn("🔻 PostgreSQL cerrado");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await sequelize.close();
  logger.warn("🔻 PostgreSQL cerrado");
  process.exit(0);
});

process.on("unhandledRejection", (reason) =>
  logger.error(`❌ Unhandled Rejection: ${reason}`)
);

process.on("uncaughtException", (error) => {
  logger.error(`❌ Uncaught Exception: ${error.message}`);
  process.exit(1);
});

/* ================================
        INICIAR SERVIDOR
================================ */
startServer();
