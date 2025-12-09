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

      // Verificar si el usuario ya existe
      const existingUser = await UsuarioMongo.findOne({ email });
      if (existingUser) {
        return { success: false, message: "El usuario ya existe" };
      }

      const passwordHash = await hashPassword(password);

      // Crear usuario en MongoDB
      const usuario = await UsuarioMongo.create({
        nombre,
        email,
        password_hash: passwordHash,
        rol_id: rol_id || 2,
      });

      // Obtener rol desde Postgres si existe
      let rolNombre = "sin-rol";
      try {
        const rol = await Rol.findByPk(usuario.rol_id);
        if (rol) rolNombre = rol.nombre;
      } catch (error) {
        logger.warn(
          "No se pudo obtener rol de Postgres al registrar usuario, usando rol por defecto:",
          error
        );
      }

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
  //                       LOGIN (MongoDB) con logs
  // ============================================================
  async login(email, password) {
    try {
      console.log("🔍 Buscando usuario en Mongo:", email);
      const usuario = await UsuarioMongo.findOne({ email });

      if (!usuario) {
        console.log("❌ Usuario no encontrado");
        return { success: false, message: "Credenciales inválidas" };
      }

      if (!usuario.activo) {
        console.log("❌ Usuario inactivo:", usuario);
        return { success: false, message: "Usuario inactivo" };
      }

      console.log("🔑 Comparando contraseña...");
      const isValid = await comparePassword(password, usuario.password_hash);
      console.log("Resultado comparePassword:", isValid);

      if (!isValid) {
        console.log("❌ Contraseña incorrecta");
        return { success: false, message: "Credenciales inválidas" };
      }

      console.log("✅ Usuario validado:", usuario.email);

      let rolNombre = "sin-rol";
      try {
        const rol = await Rol.findByPk(usuario.rol_id);
        if (rol) rolNombre = rol.nombre;
      } catch (err) {
        console.warn("⚠️ No se pudo obtener rol:", err);
      }

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
      console.error("💥 ERROR INTERNO login:", error);
      return { success: false, message: "Error en el login" };
    }
  }

  // ============================================================
  //                 GET PROFILE (MongoDB)
  // ============================================================
  async getProfile(userId) {
    try {
      const usuario = await UsuarioMongo.findById(userId).select(
        "-password_hash"
      );

      if (!usuario) {
        return { success: false, message: "Usuario no encontrado" };
      }

      let rolNombre = "sin-rol";
      try {
        const rol = await Rol.findByPk(usuario.rol_id);
        if (rol) rolNombre = rol.nombre;
      } catch (error) {
        logger.warn(
          "No se pudo obtener rol de Postgres al obtener perfil, usando rol por defecto:",
          error
        );
      }

      return {
        success: true,
        data: {
          ...usuario.toObject(),
          rol_nombre: rolNombre,
        },
      };
    } catch (error) {
      logger.error("Error en AuthService.getProfile:", error);
      return { success: false, message: "Error al obtener perfil" };
    }
  }
}

export default new AuthService();
