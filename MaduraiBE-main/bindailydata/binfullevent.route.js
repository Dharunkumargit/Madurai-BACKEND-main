// routes/binFullEvent.routes.js - Route definitions only
import { Router } from 'express';
import { BinFullEventController } from './binfullevent.controller.js';

const router = Router();


router.get('/analytics', BinFullEventController.getAnalytics);
router.get('/binwise', BinFullEventController.getBinWise);


export default router;
