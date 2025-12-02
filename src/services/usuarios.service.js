// src/services/usuarios.service.js
import Usuario from "../models/usuario.model.js";
import Rol from "../models/rol.model.js";
import { hashPassword, comparePassword } from "../utils/helpers.js";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";

class UsuarioService {
  // Obtener todos los usuarios
  async getAllUsuarios() {
    try {
      const usuarios = await Usuario.findAll({
        attributes: { exclude: ["password_hash"] },
        include: [{ model: Rol, as: "rol", attributes: ["nombre"] }],
        order: [["id", "ASC"]],
      });
      return { success: true, data: usuarios };
    } catch (error) {
      logger.error("Error en UsuarioService.getAllUsuarios:", error);
      return { success: false, message: "Error al obtener usuarios" };
    }
  }

  // Obtener usuario por ID
  async getUsuarioById(id) {
    try {
      const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ["password_hash"] },
        include: [{ model: Rol, as: "rol", attributes: ["nombre"] }],
      });
      if (!usuario) return { success: false, message: "Usuario no encontrado" };
      return {
        success: true,
        data: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol_id: usuario.rol_id,
          rol_nombre: usuario.rol?.nombre || "sin-rol",
        },
      };
    } catch (error) {
      logger.error("Error en UsuarioService.getUsuarioById:", error);
      return { success: false, message: "Error al obtener usuario" };
    }
  }

  // Actualizar usuario (incluye rol_id)
  async updateUsuario(id, userData) {
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return { success: false, message: "Usuario no encontrado" };

      // Si viene contraseña, hash
      if (userData.password) {
        userData.password_hash = await hashPassword(userData.password);
        delete userData.password;
      }

      // Actualizar usuario
      await usuario.update(userData);

      // Obtener usuario actualizado con rol
      const usuarioActualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ["password_hash"] },
        include: [{ model: Rol, as: "rol", attributes: ["nombre"] }],
      });

      return {
        success: true,
        data: {
          id: usuarioActualizado.id,
          nombre: usuarioActualizado.nombre,
          email: usuarioActualizado.email,
          rol_id: usuarioActualizado.rol_id,
          rol_nombre: usuarioActualizado.rol?.nombre || "sin-rol",
        },
        message: "Usuario actualizado exitosamente",
      };
    } catch (error) {
      logger.error("Error en UsuarioService.updateUsuario:", error);
      return { success: false, message: "Error al actualizar usuario" };
    }
  }

  // Soft delete (desactivar usuario)
  async deleteUsuario(id) {
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return { success: false, message: "Usuario no encontrado" };

      await usuario.update({ activo: false });
      return { success: true, message: "Usuario desactivado exitosamente" };
    } catch (error) {
      logger.error("Error en UsuarioService.deleteUsuario:", error);
      return { success: false, message: "Error al desactivar usuario" };
    }
  }

  // Hard delete (eliminar permanentemente)
  async hardDeleteUsuario(id) {
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return { success: false, message: "Usuario no encontrado" };

      await usuario.destroy();
      return { success: true, message: "Usuario eliminado permanentemente" };
    } catch (error) {
      logger.error("Error en UsuarioService.hardDeleteUsuario:", error);
      return { success: false, message: "Error al eliminar usuario" };
    }
  }

  // LOGIN
  async login({ email, password }) {
    try {
      const usuario = await Usuario.findOne({
        where: { email },
        include: [{ model: Rol, as: "rol", attributes: ["nombre"] }],
      });
      if (!usuario) return { success: false, message: "Usuario no encontrado" };

      const match = await comparePassword(password, usuario.password_hash);
      if (!match) return { success: false, message: "Contraseña incorrecta" };

      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          rol_id: usuario.rol_id,
          rol_nombre: usuario.rol?.nombre || "sin-rol",
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      return {
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol_id: usuario.rol_id,
            rol_nombre: usuario.rol?.nombre || "sin-rol",
          },
          token,
        },
      };
    } catch (error) {
      logger.error("Error en UsuarioService.login:", error);
      return { success: false, message: "Error al iniciar sesión" };
    }
  }

  // REGISTER
  async register({ nombre, email, password, rol_id }) {
    try {
      const existing = await Usuario.findOne({ where: { email } });
      if (existing)
        return { success: false, message: "El email ya está registrado" };

      const password_hash = await hashPassword(password);

      const usuario = await Usuario.create({
        nombre,
        email,
        password_hash,
        rol_id,
      });

      await usuario.reload({
        include: [{ model: Rol, as: "rol", attributes: ["nombre"] }],
      });

      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          rol_id: usuario.rol_id,
          rol_nombre: usuario.rol?.nombre || "sin-rol",
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      return {
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol_id: usuario.rol_id,
            rol_nombre: usuario.rol?.nombre || "sin-rol",
          },
          token,
        },
      };
    } catch (error) {
      logger.error("Error en UsuarioService.register:", error);
      return { success: false, message: "Error al registrar usuario" };
    }
  }
}

export default new UsuarioService();
