import express from 'express';

import CatalogController from '../controllers/catalog.controller';
import PriceController from '../controllers/price.controller';
import route from './variation.route';

const router = express.Router();

/**
 * for all endpoints below, you can pass over `type` query parameter
 * type can be one of `wholesale`, `wholesale-rep`, `retail`, etc ...
 * based on the type, it calculates the discount price
 */
router.use(PriceController.res_products_with_additional_prices);

router.get('/', CatalogController.list);
router.post('/', CatalogController.create);
router.get('/:id', CatalogController.get);
router.put('/:id', CatalogController.update);
router.delete('/:id', CatalogController.destroy);
router.use('/:id/variation', route);
router.post('/thumbnail', CatalogController.uploadThumbnail);

export default router;
