import usuarioService from "../services/usuarios.service.js";

const UsuarioController = {
  // Obtener todos los usuarios (solo admin)
  async getAll(req, res) {
    try {
      const result = await usuarioService.getAllUsuarios();
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al obtener usuarios" });
    }
  },

  // Obtener usuario por ID (admin, supervisor o el propio usuario)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await usuarioService.getUsuarioById(id);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al obtener usuario" });
    }
  },

  // Crear nuevo usuario (solo admin) usando rol_id
  async create(req, res) {
    try {
      const { nombre, email, password, rol_id } = req.body;

      if (!nombre || !email || !password || !rol_id) {
        return res
          .status(400)
          .json({ success: false, message: "Faltan datos requeridos" });
      }

      const result = await usuarioService.register({
        nombre,
        email,
        password,
        rol_id,
      });

      if (!result.success) return res.status(400).json(result);

      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error al crear usuario" });
    }
  },

  // Actualizar usuario (admin o el propio usuario)
  async update(req, res) {
    try {
      const { id } = req.params;
      const userData = {};
      if (req.body.nombre) userData.nombre = req.body.nombre;
      if (req.body.email) userData.email = req.body.email;
      if (req.body.rol_id) userData.rol_id = req.body.rol_id;
      if (req.body.password) userData.password = req.body.password;

      if (Object.keys(userData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Debes enviar al menos un campo para actualizar",
        });
      }

      const result = await usuarioService.updateUsuario(id, userData);
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar usuario" });
    }
  },

  // Desactivar usuario (solo admin)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await usuarioService.deleteUsuario(id);
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error al desactivar usuario" });
    }
  },

  // Eliminar usuario permanentemente (hard delete, solo admin)
  async hardDelete(req, res) {
    try {
      const { id } = req.params;
      const result = await usuarioService.hardDeleteUsuario(id);

      if (!result.success) return res.status(400).json(result);
      res.json({ success: true, message: "Usuario eliminado permanentemente" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error al eliminar usuario" });
    }
  },

  // Login de usuario
  async login(req, res) {
    try {
      const result = await usuarioService.login(req.body);
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error al iniciar sesión" });
    }
  },

  // Registro de usuario (público, con rol_id)
  async register(req, res) {
    try {
      const { nombre, email, password, rol_id } = req.body;
      if (!nombre || !email || !password || !rol_id) {
        return res.status(400).json({
          success: false,
          message: "Faltan datos requeridos: nombre, email, password o rol_id",
        });
      }

      const result = await usuarioService.register({
        nombre,
        email,
        password,
        rol_id,
      });
      if (!result.success) return res.status(400).json(result);
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error al registrar usuario" });
    }
  },
};

export default UsuarioController;
