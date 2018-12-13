import express from 'express';

import OrderController from '../controllers/order.controller';
import ItemProductController from '../../cart/controllers/item.product.controller';

const router = express.Router();

router.use(ItemProductController.res_item_with_products);
router.get('/', OrderController.list);
router.get('/export', OrderController.export);
router.post('/', OrderController.create);
router.get('/:id', OrderController.orderById);
router.get('/customer/:customer_id', OrderController.ordersByCustomer);
router.put('/:id', OrderController.update);
router.put('/:id/notes', OrderController.updateNotes);
router.put('/:id/refund', OrderController.refund);
router.delete('/:id', OrderController.destroy);

export default router;
