import Categoria from '../models/categoria.model.js';
import logger from '../config/logger.js';

class CategoriaService {
  async getAllCategorias() {
    try {
      const categorias = await Categoria.findAll({
        order: [['nombre', 'ASC']]
      });
      return { success: true, data: categorias };
    } catch (error) {
      logger.error('Error en CategoriaService.getAllCategorias:', error);
      return { success: false, message: 'Error al obtener categorías' };
    }
  }

  async getCategoriaById(id) {
    try {
      const categoria = await Categoria.findByPk(id, {
        include: ['productos']
      });
      if (!categoria) {
        return { success: false, message: 'Categoría no encontrada' };
      }
      return { success: true, data: categoria };
    } catch (error) {
      logger.error('Error en CategoriaService.getCategoriaById:', error);
      return { success: false, message: 'Error al obtener categoría' };
    }
  }

  async createCategoria(categoriaData) {
    try {
      const categoria = await Categoria.create(categoriaData);
      return { 
        success: true, 
        data: categoria, 
        message: 'Categoría creada exitosamente' 
      };
    } catch (error) {
      logger.error('Error en CategoriaService.createCategoria:', error);
      return { success: false, message: 'Error al crear categoría' };
    }
  }

  async updateCategoria(id, categoriaData) {
    try {
      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        return { success: false, message: 'Categoría no encontrada' };
      }

      await categoria.update(categoriaData);
      return { 
        success: true, 
        data: categoria, 
        message: 'Categoría actualizada exitosamente' 
      };
    } catch (error) {
      logger.error('Error en CategoriaService.updateCategoria:', error);
      return { success: false, message: 'Error al actualizar categoría' };
    }
  }

  async deleteCategoria(id) {
    try {
      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        return { success: false, message: 'Categoría no encontrada' };
      }

      // Verificar si tiene productos asociados
      const productosCount = await categoria.countProducts();
      if (productosCount > 0) {
        return { 
          success: false, 
          message: 'No se puede eliminar categoría con productos asociados' 
        };
      }

      await categoria.destroy();
      return { success: true, message: 'Categoría eliminada exitosamente' };
    } catch (error) {
      logger.error('Error en CategoriaService.deleteCategoria:', error);
      return { success: false, message: 'Error al eliminar categoría' };
    }
  }
}

// Exportamos usando ES Modules
export default new CategoriaService();
