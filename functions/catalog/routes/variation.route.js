import express from 'express';

import VariationController from '../controllers/variation.controller';

const router = express.Router({ mergeParams: true });

router.use(VariationController.findProduct);
router.get('/', VariationController.list);
router.get('/:variation_id', VariationController.get);
router.post('/', VariationController.create);
router.put('/:variation_id', VariationController.update);
router.delete('/:variation_id', VariationController.destroy);

export default router;
