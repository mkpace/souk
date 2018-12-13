import express from 'express';

import ShippingController from '../controllers/shipping.controller';

// Assemble routing
const router = express.Router();

router.get('/rate', ShippingController.getRate);
// router.get('/validate-address', ShippingController.validateAddress);
// router.post('/fulfilment', ShippingController.sendOrderToShipStation);
// router.get('/fulfilment/:id', ShippingController.getOrderFromShipStation);

export default router;
