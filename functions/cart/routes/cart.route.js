import express from 'express';

import CartController from '../controllers/cart.controller';
import ItemProductController from '../controllers/item.product.controller';

// Assemble routing
const router = express.Router();

router.use(ItemProductController.res_item_with_products);
router.get('/', CartController.list);
router.get('/:id', CartController.cartById);
router.get('/user/:user_id', CartController.cartByUser);
router.put('/user/:user_id', CartController.update);
router.post('/user/:user_id', CartController.create);
router.delete('/user/:user_id', CartController.destroy);

export default router;
