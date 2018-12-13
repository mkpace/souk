import express from 'express';

import CouponController from '../controllers/coupon.controller';

// Assemble routing
const router = express.Router();

router.get('/', CouponController.list);
router.post('/', CouponController.create);
router.get('/code/:code', CouponController.couponByCode);
router.get('/:id', CouponController.couponById);
router.put('/:id', CouponController.update);
router.delete('/:id', CouponController.destroy);

export default router;
