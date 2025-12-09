// ===================== IMPORTS =====================
import UsuarioMongo from "../models/usuario.mongo.model.js";
import Rol from "../models/rol.model.js";
import { hashPassword, comparePassword } from "../utils/helpers.js";
import { generateToken } from "../utils/jwt.js";
import logger from "../config/logger.js";

class AuthService {
  // ============================================================
  //                  REGISTER (MongoDB)
  // ============================================================
  async register(userData) {
    try {
      const { nombre, email, password, rol_id } = userData;

      // Buscar usuario en MONGO
      const existingUser = await UsuarioMongo.findOne({ email });
      if (existingUser) {
        return { success: false, message: "El usuario ya existe" };
      }

      const passwordHash = await hashPassword(password);

      // Crear usuario en MongoDB
      const usuario = await UsuarioMongo.create({
        nombre,
        email,
        password: passwordHash, // 👈 CAMBIO IMPORTANTE
        rol_id: rol_id || 2,
      });

      // Rol en Postgres
      const rol = await Rol.findByPk(usuario.rol_id);
      const rolNombre = rol?.nombre || "sin-rol";

      const token = generateToken({
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol_id,
        rol_nombre: rolNombre,
      });

      return {
        success: true,
        data: {
          user: {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol_id: usuario.rol_id,
            rol_nombre: rolNombre,
          },
          token,
        },
        message: "Usuario registrado exitosamente",
      };
    } catch (error) {
      logger.error("Error en AuthService.register:", error);
      return { success: false, message: "Error al registrar usuario" };
    }
  }

  // ============================================================
  //                       LOGIN (MongoDB)
  // ============================================================
  async login(email, password) {
    try {
      const usuario = await UsuarioMongo.findOne({ email });

      if (!usuario) {
        return { success: false, message: "Credenciales inválidas" };
      }

      if (!usuario.activo) {
        return { success: false, message: "Usuario inactivo" };
      }

      const isValidPassword = await comparePassword(
        password,
        usuario.password // 👈 CAMBIO IMPORTANTE
      );

      if (!isValidPassword) {
        return { success: false, message: "Credenciales inválidas" };
      }

      const rol = await Rol.findByPk(usuario.rol_id);
      const rolNombre = rol?.nombre || "sin-rol";

      const token = generateToken({
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol_id,
        rol_nombre: rolNombre,
      });

      return {
        success: true,
        data: {
          user: {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol_id: usuario.rol_id,
            rol_nombre: rolNombre,
          },
          token,
        },
        message: "Login exitoso",
      };
    } catch (error) {
      logger.error("💥 Error en AuthService.login:", error);
      return { success: false, message: "Error en el login" };
    }
  }

  // ============================================================
  //                 GET PROFILE (MongoDB)
  // ============================================================
  async getProfile(userId) {
    try {
      const usuario = await UsuarioMongo.findById(userId).select("-password");

      if (!usuario) {
        return { success: false, message: "Usuario no encontrado" };
      }

      const rol = await Rol.findByPk(usuario.rol_id);

      return {
        success: true,
        data: {
          ...usuario.toObject(),
          rol_nombre: rol?.nombre || "sin-rol",
        },
      };
    } catch (error) {
      logger.error("Error en AuthService.getProfile:", error);
      return { success: false, message: "Error al obtener perfil" };
    }
  }
}

export default new AuthService();
