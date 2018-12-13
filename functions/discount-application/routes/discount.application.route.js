import express from 'express';

import DiscountApplicationController from '../controllers/discount.application.controller';

const router = express.Router();

router.get('/', DiscountApplicationController.list);
router.post('/user/:user_id', DiscountApplicationController.create);
router.get('/:id', DiscountApplicationController.getOne);
router.put('/:id', DiscountApplicationController.update);
router.put('/:id/approve', DiscountApplicationController.approve);
router.delete('/:id', DiscountApplicationController.destroy);
router.post('/document', DiscountApplicationController.uploadDocument);

export default router;
