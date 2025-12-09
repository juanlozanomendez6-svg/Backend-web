import UsuarioMongo from "../models/usuario.mongo.model.js";
import Rol from "../models/rol.model.js"; // Sigue en PostgreSQL
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/helpers.js";
import logger from "../config/logger.js";

class UsuarioMongoService {
  // Obtener todos
  async getAllUsuarios() {
    try {
      const users = await UsuarioMongo.find().lean();

      // Mapear con roles (SQL)
      const roles = await Rol.findAll({ raw: true });

      const data = users.map((u) => ({
        ...u,
        rol_nombre: roles.find((r) => r.id === u.rol_id)?.nombre || "sin-rol",
      }));

      return { success: true, data };
    } catch (error) {
      logger.error(error);
      return { success: false, message: "Error obteniendo usuarios" };
    }
  }

  // Obtener por ID
  async getUsuarioById(id) {
    try {
      const user = await UsuarioMongo.findById(id).lean();
      if (!user) return { success: false, message: "Usuario no encontrado" };

      const rol = await Rol.findByPk(user.rol_id);

      return {
        success: true,
        data: {
          ...user,
          rol_nombre: rol?.nombre || "sin-rol",
        },
      };
    } catch (error) {
      return { success: false, message: "Error obteniendo usuario" };
    }
  }

  // Crear usuario
  async register({ nombre, email, password, rol_id }) {
    try {
      const exists = await UsuarioMongo.findOne({ email });
      if (exists) return { success: false, message: "Email ya registrado" };

      const password_hash = await hashPassword(password);

      const usuario = await UsuarioMongo.create({
        nombre,
        email,
        password_hash,
        rol_id,
      });

      const rol = await Rol.findByPk(rol_id);

      const token = jwt.sign(
        {
          id: usuario._id,
          email: usuario.email,
          rol_id,
          rol_nombre: rol?.nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      return { success: true, data: { usuario, token } };
    } catch (error) {
      return { success: false, message: "Error registrando usuario" };
    }
  }

  // Login
  async login({ email, password }) {
    try {
      const usuario = await UsuarioMongo.findOne({ email });
      if (!usuario) return { success: false, message: "Usuario no encontrado" };

      const match = await comparePassword(password, usuario.password_hash);
      if (!match) return { success: false, message: "Contraseña incorrecta" };

      const rol = await Rol.findByPk(usuario.rol_id);

      const token = jwt.sign(
        {
          id: usuario._id,
          email: usuario.email,
          rol_id: usuario.rol_id,
          rol_nombre: rol?.nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      return { success: true, data: { usuario, token } };
    } catch (error) {
      return { success: false, message: "Error al iniciar sesión" };
    }
  }

  // Actualizar
  async updateUsuario(id, userData) {
    try {
      if (userData.password) {
        userData.password_hash = await hashPassword(userData.password);
        delete userData.password;
      }

      const updated = await UsuarioMongo.findByIdAndUpdate(id, userData, {
        new: true,
      });

      if (!updated) return { success: false, message: "Usuario no encontrado" };

      return { success: true, data: updated };
    } catch (error) {
      return { success: false, message: "Error actualizando usuario" };
    }
  }

  // Soft delete
  async deleteUsuario(id) {
    try {
      const updated = await UsuarioMongo.findByIdAndUpdate(
        id,
        { activo: false },
        { new: true }
      );
      if (!updated) return { success: false, message: "Usuario no encontrado" };

      return { success: true, message: "Usuario desactivado" };
    } catch (error) {
      return { success: false, message: "Error desactivando usuario" };
    }
  }

  // Hard delete
  async hardDeleteUsuario(id) {
    try {
      const deleted = await UsuarioMongo.findByIdAndDelete(id);
      if (!deleted) return { success: false, message: "Usuario no encontrado" };

      return { success: true, message: "Usuario eliminado permanentemente" };
    } catch (error) {
      return { success: false, message: "Error eliminando usuario" };
    }
  }
}

export default new UsuarioMongoService();
