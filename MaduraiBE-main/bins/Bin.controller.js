import * as BinService from "../bins/Bin.service.js";

export const createBin = async (req, res) => {
  try {
    const {
      zone,
      ward,
      street,
      latitude,
      longitude,
      bintype,
      capacity,
    } = req.body;

    if (
      !zone ||
      !ward ||
      !street ||
      !latitude ||
      !longitude ||
      !bintype ||
      !capacity 
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const bin = await BinService.addBin(req.body);

    res.status(201).json({
      success: true,
      message: "Bin created successfully",
      data: bin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getAllBins = async (req, res) => {
  try {
    const {
      filter = "all",
      page = 1,
      limit = 9,
      search = "",
      export: isExport = "false",
    } = req.query;

    let filterCondition = {};

    // 🔹 FILTER BY FILL PERCENTAGE
    switch (filter) {
      case "0-50":
        // 🔥 Show only ACTIVE bins in 0-50% range
        filterCondition.status = { $ne: "Inactive" };
        filterCondition.filled = { $gte: 0, $lte: 50 };
        break;
      case "51-75":
        // 🔥 Show only ACTIVE bins in 51-75% range
        filterCondition.status = { $ne: "Inactive" };
        filterCondition.filled = { $gte: 51, $lte: 75 };
        break;
      case "76-99":
        // 🔥 Show only ACTIVE bins in 76-99% range
        filterCondition.status = { $ne: "Inactive" };
        filterCondition.filled = { $gte: 76, $lte: 99 };
        break;
      case "100":
        // 🔥 Show only ACTIVE bins at 100%
        filterCondition.status = { $ne: "Inactive" };
        filterCondition.filled = 100;
        break;
      case "inactive":
        // 🔥 Show only INACTIVE bins
        filterCondition.status = "Inactive";
        break;
      // 🔥 "all" case: NO status filter - shows BOTH active and inactive
      // filterCondition is empty, so all bins shown
    }

    // 🔹 SEARCH
    if (search) {
      filterCondition.$or = [
        { binid: { $regex: search, $options: "i" } },
        { zone: { $regex: search, $options: "i" } },
        { ward: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    // 🔥 EXPORT MODE (NO PAGINATION)
    if (isExport === "true") {
      const data = await BinService.getAllBinsForExport(filterCondition);
      return res.json({ success: true, data });
    }

    // 🔹 NORMAL PAGINATION
    const result = await BinService.getAllBins(
      filterCondition,
      Number(page),
      Number(limit)
    );

    res.json({
      success: true,
      data: result.data,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};



export const getBin = async (req, res) => {
  const bin = await BinService.getBinById(req.params.id);
  if (!bin) return res.status(404).json({ message: "Bin not found" });
  res.json({ success: true, data: bin });
};

export const updateBin = async (req, res) => {
  try {
    const bin = await BinService.updateBinService(
      req.params.id,
      req.body
    );

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: "Bin not found",
      });
    }

    res.json({
      success: true,
      message: "Bin updated successfully",
      data: bin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBin = async (req, res) => {
  await BinService.deleteBin(req.params.id);
  res.json({ success: true, message: "Bin deleted successfully" });
};

export const getBinReport = async (req, res) => {
  try {
    const report = await BinService.getBinReport();
    res.json({ success: true, total: report.length, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
