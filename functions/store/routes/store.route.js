import express from 'express';

import StoreController from '../controllers/store.controller';

const router = express.Router();

router.get('/', StoreController.list);
router.post('/', StoreController.create);
router.put('/:id', StoreController.update);
router.delete('/:id', StoreController.destroy);

export default router;
