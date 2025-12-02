import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';
import RolController from '../controllers/roles.controller.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('admin'), RolController.getAll);
router.get('/:id', authorizeRoles('admin'), RolController.getById);
router.post('/', authorizeRoles('admin'), RolController.create);
router.put('/:id', authorizeRoles('admin'), RolController.update);
router.delete('/:id', authorizeRoles('admin'), RolController.delete);

export default router;
