import express from 'express';

import ReportsController from '../controllers/reports.controller';

// Assemble routing
const router = express.Router();

router.get('/sales/monthly/:month', ReportsController.getMonthlySalesReport);
router.get('/sales/monthly', ReportsController.getPeriodSalesReport);

export default router;
