import express from 'express';

import UserController from '../controllers/user.controller';

// Assemble routing
const router = express.Router();

router.get('/', UserController.list);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.put('/:id/changePassword', UserController.changePassword);
router.put('/status/:id', UserController.updateStatus);
router.delete('/:id', UserController.destroy);
router.post('/avatar', UserController.uploadAvatar);
router.delete('/email/:email', UserController.destroyByEmail);

export default router;
