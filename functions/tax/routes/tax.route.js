import express from 'express';

import TaxController from '../controllers/tax.controller';

// Assemble routing
const router = express.Router();

router.get('/', TaxController.list);
router.get('/getRate', TaxController.getRate);
router.get('/:id', TaxController.getOne);
router.post('/', TaxController.create);
router.put('/:id', TaxController.update);
router.delete('/:id', TaxController.destroy);

export default router;
