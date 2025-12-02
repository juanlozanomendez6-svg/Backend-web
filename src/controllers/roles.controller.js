import rolService from '../services/roles.service.js';

const RolController = {
  async getAll(req, res) {
    try {
      const result = await rolService.getAllRoles();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener roles' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await rolService.getRolById(id);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener rol' });
    }
  },

  async create(req, res) {
    try {
      const result = await rolService.createRol(req.body);
      if (!result.success) return res.status(400).json(result);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al crear rol' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await rolService.updateRol(id, req.body);
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar rol' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await rolService.deleteRol(id);
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar rol' });
    }
  }
};

export default RolController;
