// src/services/roles.service.js

import Rol from '../models/rol.model.js';
import logger from '../config/logger.js';

class RolService {
  async getAllRoles() {
    try {
      const roles = await Rol.findAll({
        order: [['id', 'ASC']]
      });
      return { success: true, data: roles };
    } catch (error) {
      logger.error('Error en RolService.getAllRoles:', error);
      return { success: false, message: 'Error al obtener roles' };
    }
  }

  async getRolById(id) {
    try {
      const rol = await Rol.findByPk(id);
      if (!rol) {
        return { success: false, message: 'Rol no encontrado' };
      }
      return { success: true, data: rol };
    } catch (error) {
      logger.error('Error en RolService.getRolById:', error);
      return { success: false, message: 'Error al obtener rol' };
    }
  }

  async createRol(rolData) {
    try {
      const rol = await Rol.create(rolData);
      return { success: true, data: rol, message: 'Rol creado exitosamente' };
    } catch (error) {
      logger.error('Error en RolService.createRol:', error);
      return { success: false, message: 'Error al crear rol' };
    }
  }
}

// Exportar como ES Module
export default new RolService();
