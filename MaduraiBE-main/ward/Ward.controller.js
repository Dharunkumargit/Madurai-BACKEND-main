import * as WardService from "../ward/Ward.service.js";

export const createWard = async (req, res) => {
  try {
    const ward = await WardService.createWard(req.body);

    res.status(201).json({
      success: true,
      message: "Ward Created Successfully!",
      data: ward,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWards = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const result = await WardService.getWards(page, limit);

    res.status(200).json({
      success: true,
      data: result.wards,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch wards!",
    });
  }
};



// ------ Ward Report Controller ------

export const getWardReport = async (req, res) => {
  try {
    const report = await WardService.getWardReport();

    res.status(200).json({
      success: true,
      message: "Ward Report fetched successfully",
      data: report,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateWard = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedWard = await WardService.updateWard(id, req.body);

    res.status(200).json({
      success: true,
      message: "Ward Updated Successfully!",
      data: updatedWard,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- DELETE ----------------
export const deleteWard = async (req, res) => {
  try {
    const { id } = req.params;

    await WardService.deleteWard(id);

    res.status(200).json({
      success: true,
      message: "Ward Deleted Successfully!",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
