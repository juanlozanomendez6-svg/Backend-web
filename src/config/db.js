import { Sequelize } from "sequelize";
import "dotenv/config";

// Saber si estamos en producción (para Neon)
const isProduction = process.env.NODE_ENV === "production";

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: !isProduction ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: isProduction
        ? {
            require: true,
            rejectUnauthorized: false, // Necesario para Neon
          }
        : false,
    },
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a Neon establecida correctamente.");
    return true;
  } catch (error) {
    console.error("❌ Error conectando a Neon:", error);
    return false;
  }
};

// Sincronizar modelos
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("✅ Modelos sincronizados con la base de datos");
    return true;
  } catch (error) {
    console.error("❌ Error sincronizando modelos:", error);
    return false;
  }
};

// Cerrar conexión
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log("✅ Conexión a la base de datos cerrada");
    return true;
  } catch (error) {
    console.error("❌ Error cerrando conexión:", error);
    return false;
  }
};

export { sequelize, testConnection, syncModels, closeConnection };
