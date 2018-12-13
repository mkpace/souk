import express from 'express';
import DailyOrdersController from '../controllers/daily-orders.controller';

// Assemble routing
const router = express.Router();

router.get('/', DailyOrdersController.list);

export default router;
