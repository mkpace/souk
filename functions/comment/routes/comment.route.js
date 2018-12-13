import express from 'express';

import CommentController from '../controllers/comment.controller';

const router = express.Router();

router.get('/', CommentController.list);
router.get('/:id', CommentController.getOne);
router.put('/:id', CommentController.update);
router.put('/:id/approve', CommentController.approve);
router.delete('/:id', CommentController.destroy);

router.get('/product/:product_id/', CommentController.listByProduct);
router.post('/product/:product_id/', CommentController.create);

export default router;
