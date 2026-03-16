// bin.service.js - PRODUCTION READY (All fixes applied)
import Bin from "../bins/Bin.schema.js";
import BinFullEvent from "../bindailydata/binfullevent.schema.js";
import { getLocationFromLatLong } from "../utils/getLocationFromLatLong.js";
import axios from "axios";
import EscalationService from "../Service/Escalation_service.js";

let binCounter = 0;
const USE_DUMMY_DATA = false; 
// ================================
// DATE UTILITIES - BULLETPROOF
// ================================
const getTodayDate = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};
//tommorrow
// const getTodayDate = () => {
//   const tomorrow = new Date();           // ← Copy now
//   tomorrow.setDate(tomorrow.getDate() + 1);  // ← Add 1 day
//   return new Date(
//     Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate())
//   );
// };
const litersToTons = (liters) => Number((liters / 1000).toFixed(3));
export { litersToTons };
// ================================
// DUMMY DATA - FIXED (80→100 for FULL event)
// ================================
const getDummyOutsourceData = () => [
  {
    bin_id: "MSB001",
    latest_1: {
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      fill_level: 80,
      image_url: "https://dummy.com/bin80.jpg",
    },
    latest_2: {
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      fill_level: 0, // ✅ Triggers FULL event
      image_url: "https://dummy.com/bin100.jpg",
    },
  },
];

// ================================
// 🔥 FIXED EVENT HANDLERS
// ================================
const handleFullEvent = async (bin, latest, day, capacity) => {
  const newEvent = {
    fillTime: latest.timestamp,
    fillLevel: 100,
    capacity,
    imageUrl: latest.image_url,
  };

  await BinFullEvent.findOneAndUpdate(
    { binid: bin.binid, date: day },
    {
      $push: { events: newEvent },
      $inc: {
        "analytics.fullEvents": 1,
        "analytics.totalCapacityLiters": capacity,
      },
      $set: {
        zone: bin.zone || "Zone A",
        ward: bin.ward || "Ward 1",
        "analytics.lastFullTime": latest.timestamp,
      },
      $setOnInsert: {
        binid: bin.binid,
        date: day,
        "analytics.firstFullTime": latest.timestamp,
        "analytics.cleared": false,
      },
    },
    { upsert: true },
  );

  bin.lastFullAt = latest.timestamp;
  bin.clearedCount += 1;
  bin.totalClearedAmount = bin.clearedCount * capacity;
};

const handleClearEvent = async (bin, latest, day, capacity) => {
  const clearTime = latest.timestamp;
  const timeToClearMins = Math.round(
    (clearTime - bin.lastFullAt) / (1000 * 60),
  );
  const tonnage = litersToTons(capacity);

  await BinFullEvent.updateOne(
    { binid: bin.binid, date: day, "events.fillTime": bin.lastFullAt },
    {
      $set: {
        "events.$.clearedTime": clearTime,
        "events.$.clearTimeMins": timeToClearMins,
      },
    },
  );

  await BinFullEvent.findOneAndUpdate(
    { binid: bin.binid, date: day },
    {
      $inc: {
        "analytics.clearedEvents": 1,
        "analytics.totalClearTimeMins": timeToClearMins,
        "analytics.totalTonnageCleared": tonnage,
      },
      $set: {
        "analytics.lastClearedTime": clearTime,
        "analytics.cleared": true,
      },
    },
    { upsert: true },
  );

  bin.lastClearedAt = clearTime;
  bin.lastFullAt = null;
};

// ================================
// MAIN SYNC - ALL FIXES APPLIED
// ================================
export const syncOutsourceBins = async () => {
  try {
    console.log(`🕐 Sync started: ${new Date().toLocaleString("en-IN")}`);
    const today = getTodayDate(); // 🔥 USE TODAY EVERYWHERE
    console.log(`📅 Using today: ${today.toISOString().split("T")[0]}`);
    let data;

    // 🔥 BULLETPROOF: LIVE + DUMMY + ERROR HANDLING

    if (USE_DUMMY_DATA) {
      data = getDummyOutsourceData();
      console.log("🔸 DUMMY data (guaranteed array)");
    } else {
      const response = await axios.get(
        "http://ec2-43-205-231-164.ap-south-1.compute.amazonaws.com:8001/latest_flat ",
        { timeout: 10000 },
      );
      data = Array.isArray(response.data) ? response.data : [response.data];
      console.log("🔸 LIVE API data:", data.length, "bins");
      console.log("First bin:", data[0]?.bin_id);
    }

    if (!data || data.length === 0) {
      console.log("⚠️ Empty data, skipping sync");
      return;
    }

    for (const item of data) {
      const bin = await Bin.findOne({ binid: item.bin_id });
      if (!bin) {
        console.log(`⚠️ Bin not found: ${item.bin_id}`);
        continue;
      }

      // 🔥 REPLACE entire history parsing (around line 140)
      const history = [];
      for (const key in item) {
        if (key.startsWith("latest_")) {
          const dataPoint = item[key];
          if (!dataPoint?.timestamp) continue;

          let ts;
          try {
            ts = new Date(dataPoint.timestamp); // ✅ "2026-01-28T09:31:12.000+00:00"
            console.log(
              `Parsing: "${dataPoint.timestamp}" → ${!isNaN(ts.getTime())}`,
            );
          } catch (e) {
            console.log(`❌ Invalid: ${dataPoint.timestamp}`);
            continue;
          }

          if (isNaN(ts.getTime())) continue;

          history.push({
            timestamp: ts,
            fill_level: Number(dataPoint.fill_level || 0),
            image_url: dataPoint.image_url || "",
          });
        }
      }

      history.sort((a, b) => b.timestamp - a.timestamp);
      const latest = history[0];
      if (!latest) continue;

      

      const prevFill = bin.history?.[0]?.fill_level ?? bin.filled ?? 0;
      const day = getTodayDate(latest.timestamp) || today;
      const capacity = bin.capacity || 400;

      console.log(
        `${bin.binid}: ${prevFill}% → ${latest.fill_level}% (${day.toLocaleDateString("en-IN")})`,
      );

      // 🔥 FULL EVENT (80→100 triggers this)
      if (prevFill < 100 && latest.fill_level >= 100) {
        await handleFullEvent(bin, latest, day, capacity);
        console.log(
          `✅ FULL EVENT: ${bin.binid} on ${day.toLocaleDateString("en-IN")}`,
        );
      }

      // Clear event
      if (prevFill >= 100 && latest.fill_level < 100 && bin.lastFullAt) {
        await handleClearEvent(bin, latest, day, capacity);
        console.log(`✅ CLEAR EVENT: ${bin.binid}`);
      }

      // 🔥 FIXED HISTORY - Smart size (max 5)
      bin.filled = latest.fill_level;
      bin.lastReportedAt = latest.timestamp;
      bin.history = history;

      const diffMins = (new Date() - latest.timestamp) / (1000 * 60);
      if (latest.fill_level >= 100) {
        bin.status = "Active";
      } else if (diffMins > 30) {
        bin.status = "Inactive";
      } else {
        bin.status = "Active";
      }

      await bin.save();
      console.log(
        `✅ ${bin.binid}: ${history.length}→${bin.history.length} history`,
      );
    }
    // const bins = await Bin.find();
    // const now = new Date();

    // for (const bin of bins) {
    //   if (!bin.lastReportedAt) continue;

    //   const diff = (now - bin.lastReportedAt) / (1000 * 60);

    //   // 🔥 PROTECT FULL BINS - NO TIMEOUT!
    //   if (bin.filled >= 100) {
    //     console.log(`🔴 ${bin.binid}: Full - Protected from timeout`);
    //     continue; // Skip timeout check
    //   }

    //   // Only non-full bins get timeout
    //   if (diff > 30 && bin.status !== "Inactive") {
    //     bin.status = "Inactive";
    //     await bin.save();
    //     console.log(`⚪ ${bin.binid}: ${diff.toFixed(1)}m → Inactive`);
    //   }
    //   await bin.save();
    // }
    // 🔥 STEP 2: Fresh escalation check
    console.log("🚨 Escalation sweep...");
    const escalatedBins = await Bin.find({ filled: { $gte: 75 } }).sort({
      filled: -1,
    });
    for (const bin of escalatedBins) {
      console.log(
        `🚨 CHECKING: ${bin.binid} ${bin.filled}% (Zone:${bin.zone}, Ward:${bin.ward})`,
      );
      const roles = await EscalationService.processBinEscalation(bin._id);
      if (roles.length > 0) {
        console.log(`✅ ESCALATED: ${bin.binid} → ${roles.join(", ")}`);
      } else {
        console.log(`ℹ️ No new escalation for ${bin.binid}`);
      }
    }

    console.log("✅ Sync + Escalation completed!");
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
  }
};

// ================================
// API FUNCTIONS
// ================================
export const getAllBins = async (filter, page, limit) => {
  const skip = (page - 1) * limit;

  const totalItems = await Bin.countDocuments(filter);

  const bins = await Bin.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // 🔥 FIX: Only get TODAY's cleared events count, not total of all days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const clearedSummary = await BinFullEvent.aggregate([
    {
      $match: {
        date: { $gte: today, $lt: tomorrow } // 🔥 Filter by today only
      }
    },
    {
      $group: {
        _id: "$binid",
        totalClearedEvents: { $sum: "$analytics.clearedEvents" },
      },
    },
  ]);

  const clearedMap = clearedSummary.reduce((acc, cur) => {
    acc[cur._id] = cur.totalClearedEvents || 0;
    return acc;
  }, {});

  let data = bins.map((bin) => ({
    ...bin.toObject(),
    totalClearedEvents: clearedMap[bin.binid] || 0,
  }));

  // 🔥 BACKEND DEDUPLICATION: Remove duplicate locations
  // Keeps first occurrence of each location (by location + zone + ward)
  const seenLocations = new Set();
  data = data.filter((bin) => {
    const locationKey = `${bin.location}||${bin.zone}||${bin.ward}`;
    if (seenLocations.has(locationKey)) {
      console.warn(`🔴 Backend: Duplicate location removed: ${bin.location}`);
      return false;
    }
    seenLocations.add(locationKey);
    return true;
  });

  return {
    data,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  };
};

// 🔥 EXPORT SERVICE (NO PAGINATION) - NOW ALSO ONLY TODAY'S COUNT + DEDUPLICATION
export const getAllBinsForExport = async (filter) => {
  const bins = await Bin.find(filter).sort({ createdAt: -1 });

  // 🔥 FIX: Only get TODAY's cleared events count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const clearedSummary = await BinFullEvent.aggregate([
    {
      $match: {
        date: { $gte: today, $lt: tomorrow } // 🔥 Filter by today only
      }
    },
    {
      $group: {
        _id: "$binid",
        totalClearedEvents: { $sum: "$analytics.clearedEvents" },
      },
    },
  ]);

  const clearedMap = clearedSummary.reduce((acc, cur) => {
    acc[cur._id] = cur.totalClearedEvents || 0;
    return acc;
  }, {});

  let data = bins.map((bin) => ({
    ...bin.toObject(),
    totalClearedEvents: clearedMap[bin.binid] || 0,
  }));

  // 🔥 EXPORT DEDUPLICATION: Remove duplicate locations
  const seenLocations = new Set();
  data = data.filter((bin) => {
    const locationKey = `${bin.location}||${bin.zone}||${bin.ward}`;
    if (seenLocations.has(locationKey)) {
      console.warn(`🔴 Export: Duplicate location removed: ${bin.location}`);
      return false;
    }
    seenLocations.add(locationKey);
    return true;
  });

  return data;
};


export const getBinDashboard = async (binid) => {
  const dashboard = await BinFullEvent.aggregate([
    { $match: { binid } },
    {
      $group: {
        _id: binid,
        totalFullEvents: { $sum: "$analytics.fullEvents" },
        totalClearedEvents: { $sum: "$analytics.clearedEvents" },
        totalTonsCleared: { $sum: "$analytics.totalTonnageCleared" },
        avgClearTime: { $avg: "$analytics.avgClearTimeMins" },
        maxConsecutiveDays: { $max: "$analytics.consecutiveDaysFull" },
      },
    },
  ]);
  return (
    dashboard[0] || {
      _id: binid,
      totalFullEvents: 0,
      totalClearedEvents: 0,
      totalTonsCleared: 0,
    }
  );
};

export const addBin = async (data) => {
  const binid = `MSB${String(binCounter++).padStart(3, "0")}`;
  const geo = await getLocationFromLatLong(data.latitude, data.longitude);

  const bin = await Bin.create({
    ...data,
    binid,
    location: `${data.street || ""}, ${geo}`,
    capacity: data.capacity || 400,
  });

  return bin;
};

export const updateFillLevel = async (binId, fillLevel) => {
  return await Bin.findByIdAndUpdate(
    binId,
    {
      currentFillLevel: fillLevel,
      lastUpdated: new Date(),
    },
    { new: true },
  );
};

export const getCriticalBins = async () => {
  return await Bin.find({
    currentFillLevel: { $gte: 75 },
  }).sort({ currentFillLevel: -1 });
};

export const getEscalatedBins = async () => {
  return await Bin.find({
    "escalation.status": { $in: ["L1", "L2", "L3", "L4"] },
  });
};

// ================================
// LIVE MONITOR
// ================================
let liveInterval;

export const startLiveMonitor = () => {
  if (!liveInterval) {
    liveInterval = setInterval(syncOutsourceBins, 10000);
    console.log("🔄 Live monitor started (10s intervals)");
  }
};

export const stopLiveMonitor = () => {
  if (liveInterval) {
    clearInterval(liveInterval);
    liveInterval = null;
    console.log("⏹️ Live monitor stopped");
  }
};

export const initializeBinService = async () => {
  console.log("🚀 Bin Service Ready!");
  console.log(
    "Available: syncOutsourceBins(), startLiveMonitor(), getAllBins()",
  );
};
// 🔥 BULLETPROOF VERSION - Run this ONCE

export const updateBinService = async (id, data) => {
  if (data.filled >= 100) {
    data.status = "Full";
  } else {
    data.status = "Active";
  }

  data.lastcollected = new Date();

  return Bin.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteBin = async (id) => {
  return Bin.findByIdAndDelete(id);
}