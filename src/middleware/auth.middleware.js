import { verifyToken } from "../utils/jwt.js";

/**
 * Middleware para verificar que haya un token válido
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
    });
  }

  try {
    const decoded = verifyToken(token);
    // decoded debe contener { id, email, rol, rol_nombre }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

/**
 * Middleware para autorizar roles específicos o el propio usuario
 * roles: roles permitidos (ej. 'admin', 'supervisor')
 * allowSelf: booleano, si true permite que el usuario actúe sobre sí mismo
 */
export const authorizeRoles = (roles = [], allowSelf = false) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    // Comparamos con rol_nombre que es la cadena
    const isAllowedRole = roles.includes(req.user.rol_nombre);
    const isSelf = allowSelf && parseInt(req.params.id) === req.user.id;

    if (!isAllowedRole && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
};
