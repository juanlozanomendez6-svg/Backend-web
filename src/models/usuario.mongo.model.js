import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true }, // <-- CORRECTO
    rol_id: { type: Number, required: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Usuario", usuarioSchema);
