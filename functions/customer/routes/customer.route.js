import express from 'express';
import passport from 'passport';

import CustomerController from '../controllers/customer.controller';
import isAllowed from '../../common/config/auth/policies/auth.policy';

const router = express.Router();

// public endpoints
router.post('/attachment', CustomerController.uploadAttachment);
router.post('/', CustomerController.create);

// private endpoints
router.use(passport.authenticate('jwt', { session: false }), isAllowed);
router.get('/', CustomerController.list);
router.get('/stat', CustomerController.stat);
router.get('/export', CustomerController.export);
router.get('/:id', CustomerController.customerById);
router.put('/:id', CustomerController.update);
router.delete('/:id', CustomerController.destroy);

export default router;
