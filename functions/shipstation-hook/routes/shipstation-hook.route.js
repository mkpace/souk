import express from 'express';

import ShipstationHookController from '../controllers/shipstation-hook.controller';

// Assemble routing
const router = express.Router();

router.use('/', ShipstationHookController.authorize);
router.get('/', ShipstationHookController.export);
router.post('/', ShipstationHookController.shipnotify);

export default router;
