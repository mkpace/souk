import express from 'express';

import SettingController from '../controllers/setting.controller';

const router = express.Router();

router.get('/', SettingController.list);
router.post('/', SettingController.create);
router.put('/:id', SettingController.update);
router.delete('/:id', SettingController.destroy);

export default router;
