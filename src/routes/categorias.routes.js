import express from 'express';
import CategoriaController from '../controllers/categorias.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', CategoriaController.getAll);
router.get('/:id', CategoriaController.getById);

// Protected routes
router.use(authenticateToken);

// Solo admin y supervisor pueden gestionar categorías
router.get('/', authorizeRoles('admin', 'supervisor', 'cajero'), CategoriaController.getAll);
router.post('/', authorizeRoles('admin'), CategoriaController.create);
router.put('/:id', authorizeRoles('admin'), CategoriaController.update);
router.delete('/:id', authorizeRoles('admin'), CategoriaController.delete);


export default router;
