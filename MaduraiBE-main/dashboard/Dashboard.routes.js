import express from "express";
import { getDashboardData } from './Dashboard.controller.js';

const router = express.Router();

router.get('/all', getDashboardData);


export default router;
