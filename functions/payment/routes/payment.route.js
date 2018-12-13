import express from 'express';
import PaymentController from '../controllers/payment.controller';

// Assemble routing
const router = express.Router();

router.get('/:id/status', PaymentController.getStatus);

export default router;
