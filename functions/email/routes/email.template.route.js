import express from 'express';

import EmailTemplateController from '../controllers/email.template.controller';

const router = express.Router();

router.get('/', EmailTemplateController.list);
router.post('/', EmailTemplateController.create);
router.put('/:id', EmailTemplateController.update);
router.delete('/:id', EmailTemplateController.destroy);
router.post('/upload', EmailTemplateController.uploadTemplate);

export default router;
