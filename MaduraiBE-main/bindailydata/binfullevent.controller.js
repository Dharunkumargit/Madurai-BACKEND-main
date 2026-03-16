// controllers/binFullEvent.controller.js - Request/Response handling
import { BinFullEventService } from './binfullevent.service.js';



export class BinFullEventController {
  static async getAnalytics(req, res) {
    try {
      const { from, to } = req.query;
      
      if (!from || !to) {
        return res.status(400).json({ 
          error: 'from and to dates required',
          example: '/api/binfullevents/analytics?from=2026-01-20&to=2026-01-24'
        });
      }

      const analytics = await BinFullEventService.getDateRangeAnalytics(from, to);
      res.json({
        success: true,
        data: analytics,
        query: { from, to },
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  // routes/binFullEvent.routes.js
 static async getBinWise(req, res) {
  try {
    const { from, to } = req.query;
    const data = await BinFullEventService.getBinWiseAnalytics(from, to);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


}

