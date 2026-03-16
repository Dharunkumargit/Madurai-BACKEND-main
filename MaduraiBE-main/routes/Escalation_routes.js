import express from 'express';
import { 
  updateBinFillLevel, 
  getEscalationDashboard, 
  acknowledgeEscalation 
} from '../controllers/Escalation_controller.js';
import EscalationService from '../Service/Escalation_service.js';
import { sendWhatsAppAlert } from '../utils/whtasapp.js';

const router = express.Router();

// 🔥 IoT Sensor Webhook - Real-time fill level updates
router.post('/bin/update', updateBinFillLevel);

// 🔥 Dashboard - Get all critical/escalated bins
router.get('/dashboard', getEscalationDashboard);

// 🔥 Acknowledge - Mark as handled
router.post('/acknowledge', acknowledgeEscalation);

// 🔥 Get single bin escalation status
router.get('/bin/:id/status', async (req, res) => {
  const status = await EscalationService.getEscalationStatus(req.params.id);
  res.json({ success: true, status });
});




// 🔥 MAGIC SINGLE ENDPOINT
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const result = await EscalationService.getRoleEscalations(role);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      role: req.params.role
    });
  }
});

// Bonus: All escalations
router.get('/all', async () => {
  const roles = ['ACHO', 'CHO', 'Deputy Commissioner', 'Commissioner', 'Ward Supervisor', 'SI - Sanitary Inspectors'];
  const allData = await Promise.all(roles.map(role => getRoleEscalations(role)));
  res.json(allData);
});

export default router;
