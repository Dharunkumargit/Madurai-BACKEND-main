// controllers/dashboardController.js
import { DashboardService } from './Dashboard.service.js'; // 🔥 ADD THIS

export const getDashboardData = async (req, res) => {
  try {
    console.log('🔥 LIVE Dashboard - 8 Parallel Queries');
    
    const [stats, topZones, topWards, topLocations, monthlyZones, todayZones, escalationCounts] = await Promise.all([
      DashboardService.getDashboardStats(),
      DashboardService.getZoneWiseFullBins(),
      DashboardService.getWardWiseFullBins(),
      DashboardService.getTopLocations?.() || [],
      DashboardService.getMonthlyZoneTons?.() || [],
      DashboardService.getTodayZoneTons?.() || [],
      DashboardService.getEscalationLevels()  // 🔥 NEW
    ]);

    // 🔥 FORMAT ESCALATIONS FOR FRONTEND
    const escalations = [
      { level: 1, count: escalationCounts.L1 || 0 },
      { level: 2, count: escalationCounts.L2 || 0 },
      { level: 3, count: escalationCounts.L3 || 0 },
      { level: 4, count: escalationCounts.L4 || 0 }
    ];

   

    res.json({
      success: true,
      data: {
        stats,
        topZones,
        topWards,
        topLocations: topLocations || [],
        escalations,        // 🔥 YOUR FRONTEND EXPECTS THIS
        monthlyZones: monthlyZones || [],
        todayZones: todayZones || []
      }
    });
  } catch (error) {
    console.error('❌ Dashboard Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};