import authService from "../services/auth.service.js";

const AuthController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email y password son requeridos",
        });
      }

      // Log para depuración
      console.log("Datos recibidos:", req.body);

      const result = await authService.login(email, password);

      // Log del resultado del login
      console.log("Resultado login:", result);

      if (!result.success) {
        // Diferenciar mensajes para ver la causa exacta
        if (result.message === "Usuario inactivo") {
          return res.status(403).json(result); // 403 Forbidden para usuario inactivo
        }
        return res.status(401).json(result); // 401 para credenciales inválidas
      }

      res.json(result);
    } catch (error) {
      console.error("Error en AuthController.login:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.status(201).json(result);
    } catch (error) {
      console.error("Error en AuthController.register:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  async getProfile(req, res) {
    try {
      const result = await authService.getProfile(req.user.id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (error) {
      console.error("Error en AuthController.getProfile:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  async verifyToken(req, res) {
    try {
      res.json({
        success: true,
        message: "Token válido",
        user: req.user,
      });
    } catch (error) {
      console.error("Error en AuthController.verifyToken:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
};

export default AuthController;
