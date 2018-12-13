import express from 'express';

import ContactController from '../controllers/contact.controller';

const router = express.Router();

router.post('/', ContactController.create);
router.get('/', ContactController.list);
router.get('/:id', ContactController.getOne);
router.put('/:id', ContactController.update);
router.delete('/:id', ContactController.destroy);

export default router;
