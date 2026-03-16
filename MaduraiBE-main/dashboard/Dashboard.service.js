// services/DashboardService.js - FIXED 100% BIN QUERIES
import Bin from "../bins/Bin.schema.js";
import BinFullEvent from "../bindailydata/binfullevent.schema.js";

export class DashboardService {
  static cache = null;
  static cacheExpiry = 0;

  // 🔥 FIXED: More robust zone/ward 100% bin queries
  static async getZoneWiseFullBins() {
    try {
      console.log('🔍 Fetching Zone 100% bins...');
      const result = await Bin.aggregate([
        // 🔥 MATCH exactly 100% filled bins (handle numeric/string)
        {
          $match: {
            $expr: {
              $eq: [{ $toDouble: "$filled" }, 100]
            },
            zone: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: { $trim: { input: "$zone" } },  // Clean zone names
            fullBinsCount: { $sum: 1 }
          }
        },
        { $sort: { fullBinsCount: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            _id: "$_id",  // zone name
            fullBinsCount: 1
          }
        }
      ]);
      
      console.log('✅ Zones 100% bins:', result);
      return result;
    } catch (error) {
      console.error('❌ Zone full bins error:', error);
      return [];
    }
  }

  // 🔥 FIXED: Ward 100% bins (SAME LOGIC)
  static async getWardWiseFullBins() {
    try {
      console.log('🔍 Fetching Ward 100% bins...');
      const result = await Bin.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $toDouble: "$filled" }, 100]
            },
            ward: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: { $trim: { input: "$ward" } },  // Clean ward names
            fullBinsCount: { $sum: 1 }
          }
        },
        { $sort: { fullBinsCount: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            _id: "$_id",  // ward name
            fullBinsCount: 1
          }
        }
      ]);
      
      console.log('✅ Wards 100% bins:', result);
      return result;
    } catch (error) {
      console.error('❌ Ward full bins error:', error);
      return [];
    }
  }

  // 🔥 FILL LEVEL STATS - ACTIVE + INACTIVE SEPARATED + TOTAL
  static async getFillLevelStats() {
    try {
      const result = await Bin.aggregate([
        {
          $group: {
            _id: null,
            // ✅ ACTIVE BINS - Fill Level Counts (no inactive)
            zeroToFifty: {
              $sum: { 
                $cond: [
                  { $and: [
                    { $ne: ["$status", "Inactive"] },
                    { $lte: [{ $toDouble: "$filled" }, 50] }
                  ]}, 
                  1, 
                  0
                ] 
              }
            },
            fiftyOneToSeventyFive: {
              $sum: { 
                $cond: [
                  { $and: [
                    { $ne: ["$status", "Inactive"] },
                    { $gt: [{ $toDouble: "$filled" }, 50] }, 
                    { $lte: [{ $toDouble: "$filled" }, 75] }
                  ]}, 
                  1, 
                  0
                ] 
              }
            },
            seventySixToNinetyNine: {
              $sum: { 
                $cond: [
                  { $and: [
                    { $ne: ["$status", "Inactive"] },
                    { $gt: [{ $toDouble: "$filled" }, 75] }, 
                    { $lt: [{ $toDouble: "$filled" }, 100] }
                  ]}, 
                  1, 
                  0
                ] 
              }
            },
            hundred: {
              $sum: { 
                $cond: [
                  { $and: [
                    { $ne: ["$status", "Inactive"] },
                    { $eq: [{ $toDouble: "$filled" }, 100] }
                  ]}, 
                  1, 
                  0
                ] 
              }
            },
            // ✅ COUNT INACTIVE BINS
            inactiveBins: {
              $sum: { 
                $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0]
              }
            },
            // ✅ TOTAL OF ALL BINS (active + inactive)
            totalBins: { $sum: 1 }
          }
        }
      ]);
      console.log('✅ Fill levels stats:', result[0]);
      return result[0] || {};
    } catch (error) {
      console.error('❌ Fill level error:', error);
      return {};
    }
  }

  static async getDashboardStats() {
    const now = Date.now();
    if (this.cache && now < this.cacheExpiry) return this.cache;

    try {
      const [wasteStats, fillStats] = await Promise.all([
        BinFullEvent.aggregate([{ $group: { _id: null, totalWasteCollected: { $sum: "$analytics.totalTonnageCleared" } } }]),
        this.getFillLevelStats()
      ]);

      const result = {
        waste: {
          totalWasteCollected: Number((wasteStats[0]?.totalWasteCollected || 0).toFixed(2))
        },
        bins: {
          totalBins: fillStats.totalBins || 0,
          inactiveBins: fillStats.inactiveBins || 0
        },
        fillLevels: {
          zeroToFifty: fillStats.zeroToFifty || 0,
          fiftyOneToSeventyFive: fillStats.fiftyOneToSeventyFive || 0,
          seventySixToNinetyNine: fillStats.seventySixToNinetyNine || 0,
          hundred: fillStats.hundred || 0
        }
      };

      this.cache = result;
      this.cacheExpiry = now + 30000;
      return result;
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return this.cache || { waste: {}, bins: {}, fillLevels: {} };
    }
  }

  // 🔥 L1-L4 ESCALATIONS
 static async getEscalationLevels() {
  const now = new Date();
  
  // Get all 100% full bins
  const bins = await Bin.find({ filled: { $gte: 100 } })
    .select("escalation")
    .lean(); // Faster for counts

  // Count escalations
  const counts = {
    L1: 0,
    L2: 0, 
    L3: 0,
    L4: 0,
    totalFullBins: bins.length,
    timestamp: now
  };

  bins.forEach(bin => {
    const timeEsc = bin.escalation?.timeEscalations || [];
    
    // Check each level
    if (timeEsc.some(e => e.level === "L1")) counts.L1++;
    if (timeEsc.some(e => e.level === "L2")) counts.L2++;
    if (timeEsc.some(e => e.level === "L3")) counts.L3++;
    if (timeEsc.some(e => e.level === "L4")) counts.L4++;
  });

  return counts;
}




  // 🔥 EXISTING METHODS (Hotspots, Charts, etc.)
  static async getTopLocations() {
    return await BinFullEvent.aggregate([
      { $lookup: { from: "bins", localField: "binid", foreignField: "binid", as: "binData" } },
      { $unwind: { path: "$binData", preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ["$binData.location", "Unknown"] }, totalClearedTons: { $sum: "$analytics.totalTonnageCleared" } } },
      { $sort: { totalClearedTons: -1 } },
      { $limit: 5 },
      { $project: { location: "$_id", totalClearedTons: { $round: ["$totalClearedTons", 2] }, _id: 0 } }
    ]);
  }

  static async getMonthlyZoneTons() {
    const firstDay = new Date();
    firstDay.setDate(1);
    return await BinFullEvent.aggregate([
      { $match: { date: { $gte: firstDay } } },
      { $group: { _id: "$zone", totalClearedTons: { $sum: "$analytics.totalTonnageCleared" } } },
      { $sort: { totalClearedTons: -1 } },
      { $limit: 3 }
    ]);
  }

  static async getTodayZoneTons() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return await BinFullEvent.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: "$zone", totalClearedTons: { $sum: "$analytics.totalTonnageCleared" } } },
      { $sort: { totalClearedTons: -1 } },
      { $limit: 5 }
    ]);
  }
}
