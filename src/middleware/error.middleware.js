import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }

  // Error de duplicado en Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'El registro ya existe',
      field: err.errors[0]?.path
    });
  }

  // Error JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  // Error personalizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`
  });
};
