import mongoose from "mongoose";

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME, // usar base de datos específica
      // NO pongas useNewUrlParser ni useUnifiedTopology
    });
    console.log("✅ MongoDB conectado correctamente");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    throw error; // importante lanzar el error para manejarlo en server.js
  }
};

// Opcional: logs de eventos de mongoose
mongoose.connection.on("connected", () =>
  console.log("🍃 Mongoose: conectado a MongoDB")
);
mongoose.connection.on("error", (err) =>
  console.error("❌ Mongoose: error de conexión", err)
);
