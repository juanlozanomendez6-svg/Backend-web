import usuarioService from "../services/usuarios.mongo.service.js";

const UsuarioController = {
  // Obtener todos los usuarios (solo admin)
  async getAll(req, res) {
    try {
      const result = await usuarioService.getAllUsuarios();
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener usuarios",
      });
    }
  },

  // Obtener usuario por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await usuarioService.getUsuarioById(id);

      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener usuario",
      });
    }
  },

  // Crear usuario (solo admin)
  async create(req, res) {
    try {
      const { nombre, email, password, rol_id } = req.body;

      if (!nombre || !email || !password || !rol_id) {
        return res.status(400).json({
          success: false,
          message: "Faltan datos requeridos",
        });
      }

      const result = await usuarioService.register({
        nombre,
        email,
        password,
        rol_id,
      });

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error("❌ Error create:", error);
      return res.status(500).json({
        success: false,
        message: "Error al crear usuario",
      });
    }
  },

  // Actualizar usuario
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, password, rol_id } = req.body;

      const userData = {};

      if (nombre) userData.nombre = nombre;
      if (email) userData.email = email;
      if (password) userData.password = password;
      if (rol_id) userData.rol_id = rol_id;

      if (Object.keys(userData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Debes enviar al menos un campo para actualizar",
        });
      }

      const result = await usuarioService.updateUsuario(id, userData);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("❌ Error update:", error);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar usuario",
      });
    }
  },

  // Desactivar usuario (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await usuarioService.deleteUsuario(id);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("❌ Error delete:", error);
      return res.status(500).json({
        success: false,
        message: "Error al desactivar usuario",
      });
    }
  },

  // Eliminar permanentemente
  async hardDelete(req, res) {
    try {
      const { id } = req.params;

      const result = await usuarioService.hardDeleteUsuario(id);

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.success
          ? "Usuario eliminado permanentemente"
          : result.message,
      });
    } catch (error) {
      console.error("❌ Error hardDelete:", error);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar usuario",
      });
    }
  },

  // Login
  async login(req, res) {
    try {
      const result = await usuarioService.login(req.body);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("❌ Error login:", error);
      return res.status(500).json({
        success: false,
        message: "Error al iniciar sesión",
      });
    }
  },

  // Registro público
  async register(req, res) {
    try {
      const { nombre, email, password, rol_id } = req.body;

      if (!nombre || !email || !password || !rol_id) {
        return res.status(400).json({
          success: false,
          message: "Faltan datos requeridos: nombre, email, password, rol_id",
        });
      }

      const result = await usuarioService.register({
        nombre,
        email,
        password,
        rol_id,
      });

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error("❌ Error register:", error);
      return res.status(500).json({
        success: false,
        message: "Error al registrar usuario",
      });
    }
  },
};

export default UsuarioController;
