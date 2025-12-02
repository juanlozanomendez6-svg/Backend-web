// Importamos el servicio usando ES Modules
import categoriaService from '../services/categorias.service.js';

const CategoriaController = {
  async getAll(req, res) {
    try {
      const result = await categoriaService.getAllCategorias();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener categorías'
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await categoriaService.getCategoriaById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener categoría'
      });
    }
  },

  async create(req, res) {
    try {
      const result = await categoriaService.createCategoria(req.body);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear categoría'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await categoriaService.updateCategoria(id, req.body);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar categoría'
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await categoriaService.deleteCategoria(id);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar categoría'
      });
    }
  }
};

// Exportamos usando ES Modules
export default CategoriaController;
