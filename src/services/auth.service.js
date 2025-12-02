import Usuario from "../models/usuario.model.js";
import Rol from "../models/rol.model.js"; // Importar modelo Rol
import { hashPassword, comparePassword } from "../utils/helpers.js";
import { generateToken } from "../utils/jwt.js";
import logger from "../config/logger.js";

class AuthService {
  // Registrar usuario
  async register(userData) {
    try {
      const { nombre, email, password, rol_id } = userData;

      // Verificar si el usuario ya existe
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) {
        return { success: false, message: "El usuario ya existe" };
      }

      const passwordHash = await hashPassword(password);

      // Crear usuario
      const usuario = await Usuario.create({
        nombre,
        email,
        password_hash: passwordHash,
        rol_id: rol_id || 2, // Por defecto rol_id = 2
      });

      // Obtener nombre del rol
      const rol = await Rol.findByPk(usuario.rol_id);
      const rolNombre = rol?.nombre || "sin-rol";

      // Generar token con rol_nombre incluido
      const token = generateToken({
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol_id,
        rol_nombre: rolNombre, // <-- agregado
      });

      return {
        success: true,
        data: {
          user: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol_id: usuario.rol_id,
            rol_nombre: rolNombre, // <-- agregado
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

  // Login usuario
  async login(email, password) {
    try {
      // Buscar usuario incluyendo rol de forma segura
      let usuario;
      try {
        usuario = await Usuario.findOne({
          where: { email },
          include: [{ model: Rol, as: "rol", required: false }],
        });
      } catch (err) {
        logger.warn("Problema al incluir el rol, ignorando:", err);
        usuario = await Usuario.findOne({ where: { email } });
      }

      if (!usuario) {
        logger.warn(`Login fallido: usuario con email ${email} no encontrado`);
        return { success: false, message: "Credenciales inválidas" };
      }

      if (!usuario.activo) {
        logger.warn(`Login fallido: usuario ${email} inactivo`);
        return { success: false, message: "Usuario inactivo" };
      }

      const isValidPassword = await comparePassword(
        password,
        usuario.password_hash
      );

      if (!isValidPassword) {
        logger.warn(`Login fallido: contraseña incorrecta para ${email}`);
        return { success: false, message: "Credenciales inválidas" };
      }

      const rolNombre = usuario.rol?.nombre || "sin-rol";

      const token = generateToken({
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol_id,
        rol_nombre: rolNombre,
      });

      return {
        success: true,
        data: {
          user: {
            id: usuario.id,
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
      console.error(
        "💥 Error en AuthService.login:",
        error.message,
        error.stack
      );
      logger.error("💥 Error en AuthService.login:", error);
      return { success: false, message: "Error en el login" };
    }
  }

  // Obtener perfil de usuario
  async getProfile(userId) {
    try {
      let usuario;
      try {
        usuario = await Usuario.findByPk(userId, {
          attributes: { exclude: ["password_hash"] },
          include: [{ model: Rol, as: "rol", required: false }],
        });
      } catch (err) {
        logger.warn(
          "Problema al incluir el rol en getProfile, ignorando:",
          err
        );
        usuario = await Usuario.findByPk(userId, {
          attributes: { exclude: ["password_hash"] },
        });
      }

      if (!usuario) {
        return { success: false, message: "Usuario no encontrado" };
      }

      return { success: true, data: usuario };
    } catch (error) {
      logger.error("Error en AuthService.getProfile:", error);
      return { success: false, message: "Error al obtener perfil" };
    }
  }
}

export default new AuthService();
