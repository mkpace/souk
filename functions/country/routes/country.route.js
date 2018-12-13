import express from 'express';

import CountryController from '../controllers/country.controller';

const router = express.Router();

router.get('/', CountryController.list);
router.post('/', CountryController.create);
router.put('/:id', CountryController.update);
router.delete('/:id', CountryController.destroy);

export default router;
