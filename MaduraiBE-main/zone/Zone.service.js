import Zone from "../zone/Zone.schema.js";
import Bin from "../bins/Bin.schema.js";
export const createZone = async (data) => {
  const { zonename, status } = data;

  const formattedName = zonename?.trim().toLowerCase();

  const exist = await Zone.findOne({
    zonename: new RegExp(`^${formattedName}$`, "i"),
  });

  if (exist) throw new Error("Zone name already exists.");

  return await Zone.create({
    zonename: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
    status,
    alerts: [],
  });
};

export const getZones = async (page = 1, limit = 8) => {
  const skip = (page - 1) * limit;

  // 🔹 Aggregation for bins
  const zoneStats = await Bin.aggregate([
    {
      $group: {
        _id: "$zone",
        totalbins: { $sum: 1 },
        activebins: {
          $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
        },
        inactivebins: {
          $sum: { $cond: [{ $ne: ["$status", "Active"] }, 1, 0] },
        },
        totalClearedCount: { $sum: { $ifNull: ["$clearedCount", 0] } },
        totalGarbageKg: { $sum: { $ifNull: ["$totalClearedAmount", 0] } },
        avgClearTime: {
          $avg: {
            $cond: [
              { $gt: ["$avgClearTimeMins", 0] },
              "$avgClearTimeMins",
              null,
            ],
          },
        },
      },
    },
  ]);

  const totalItems = await Zone.countDocuments();

  const zones = await Zone.find()
    .skip(skip)
    .limit(limit)
    .lean();

  const formattedZones = zones.map((zone) => {
    const stat = zoneStats.find((z) => z._id === zone.zonename);

    return {
      _id: zone._id,
      zonename: zone.zonename,
      status: zone.status,
      totalbins: stat?.totalbins || 0,
      activebins: stat?.activebins || 0,
      inactivebins: stat?.inactivebins || 0,
      totalClearedCount: stat?.totalClearedCount || 0,
      totalGarbageKg: stat?.totalGarbageKg || 0,
      totalGarbageTons: stat ? stat.totalGarbageKg / 1000 : 0,
      avgClearTime: stat?.avgClearTime ? Math.round(stat.avgClearTime) : 0,
    };
  });

  return {
    zones: formattedZones,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
};


export const updateZone = async (id, data) => {
  const { zonename, totalbins, activebins, inactivebins, status } = data;

  const zone = await Zone.findById(id);
  if (!zone) throw new Error("Zone not found");

  /* Prevent duplicate zone name */
  if (zonename) {
    const formattedName = zonename.trim().toLowerCase();

    const exist = await Zone.findOne({
      _id: { $ne: id },
      zonename: new RegExp(`^${formattedName}$`, "i"),
    });

    if (exist) throw new Error("Zone name already exists");

    zone.zonename =
      formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  }

  zone.totalbins = totalbins ?? zone.totalbins;
  zone.activebins = activebins ?? zone.activebins;
  zone.inactivebins = inactivebins ?? zone.inactivebins;
  zone.status = status ?? zone.status;

  await zone.save();
  return zone;
};

/* ===================== DELETE ===================== */
export const deleteZone = async (id) => {
  const zone = await Zone.findById(id);
  if (!zone) throw new Error("Zone not found");

  await zone.deleteOne();
};
