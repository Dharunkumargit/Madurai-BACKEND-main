// services/binFullEvent.service.js - Pure business logic
import BinSchema from "../bins/Bin.schema.js";
import BinFullEvent from "./binfullevent.schema.js";

export class BinFullEventService {
  // 🔥 ZONE + WARD BREAKDOWN
  static async getDateRangeAnalytics(fromDate, toDate) {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const analytics = await BinFullEvent.aggregate([
      // 1️⃣ Filter date range
      { $match: { date: { $gte: from, $lte: to } } },

      // 2️⃣ Group by ZONE first
      {
        $group: {
          _id: { zone: "$zone" },
          wards: { $addToSet: "$ward" },
          bins: { $addToSet: "$binid" },
          totalFullEvents: { $sum: "$analytics.fullEvents" },
          totalClearedEvents: { $sum: "$analytics.clearedEvents" },
          totalTonsCleared: { $sum: "$analytics.totalTonnageCleared" },
          totalClearTimeMins: { $sum: "$analytics.totalClearTimeMins" },
          totalCapacityLiters: { $sum: "$analytics.totalCapacityLiters" },
        },
      },

      // 3️⃣ Calculate zone totals
      {
        $addFields: {
          totalWards: { $size: "$wards" },
          totalBins: { $size: "$bins" },
          avgClearTimeMins: {
            $round: [
              {
                $divide: [
                  "$totalClearTimeMins",
                  { $max: ["$totalClearedEvents", 1] },
                ],
              },
              1,
            ],
          },
          clearanceRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      "$totalClearedEvents",
                      { $max: ["$totalFullEvents", 1] },
                    ],
                  },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },

      // 4️⃣ Sort zones by tons cleared
      { $sort: { totalTonsCleared: -1 } },
    ]);

    // OVERALL TOTALS
    const overall = await BinFullEvent.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: null,
          totalZones: { $addToSet: "$zone" },
          totalBins: { $addToSet: "$binid" },
          totalFullEvents: { $sum: "$analytics.fullEvents" },
          totalClearedEvents: { $sum: "$analytics.clearedEvents" },
          totalTonsCleared: { $sum: "$analytics.totalTonnageCleared" },
        },
      },
      {
        $project: {
          totalZones: { $size: "$totalZones" },
          totalBins: { $size: "$totalBins" },
          totalFullEvents: 1,
          totalClearedEvents: 1,
          totalTonsCleared: { $round: ["$totalTonsCleared", 3] },
        },
      },
    ]);

    return {
      overall: overall[0] || {
        totalZones: 0,
        totalBins: 0,
        totalFullEvents: 0,
        totalClearedEvents: 0,
        totalTonsCleared: 0,
      },
      zones: analytics,
    };
  }

  static async getBinWiseAnalytics(fromDate, toDate) {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    // 1️⃣ Get events data
    const events = await BinFullEvent.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },

      {
        $group: {
          _id: "$binid",
          zone: { $first: "$zone" },
          ward: { $first: "$ward" },
          tonsCleared: { $sum: "$analytics.totalTonnageCleared" },
          totalClearTimeMins: { $sum: "$analytics.totalClearTimeMins" }, 
          clearedEvents: { $sum: "$analytics.clearedEvents" }, 
        },
      },
      {
        $addFields: {
          avgResponseTime: {
            $round: [
              {
                $divide: [
                  "$totalClearTimeMins",
                  { $max: ["$clearedEvents", 1] },
                ],
              },
              1,
            ],
          },
        },
      },
    ]);

    // 2️⃣ Get bin locations SEPARATELY
    const binIds = events.map((e) => e._id);
    const bins = await BinSchema.find({
      binid: { $in: binIds },
    }).select("binid location capacity");

    // 3️⃣ MERGE data
    return events.map((event) => {
      const bin = bins.find((b) => b.binid === event._id);

      return {
        binid: event._id,
        location: bin?.location || "N/A",
        capacity: bin?.capacity || 750,
        zone: event.zone,
        ward: event.ward,
        tonsCleared: parseFloat(event.tonsCleared?.toFixed(2)) || 0,
        avgResponseTime: parseFloat(event.avgResponseTime?.toFixed(1)) || 0,
      };
    });
  }
  
}
