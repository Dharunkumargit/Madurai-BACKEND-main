import * as ZoneService from "../zone/Zone.service.js";

export const createZone = async (req, res) => {
  try {
    const zone = await ZoneService.createZone(req.body);
    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getZones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const result = await ZoneService.getZones(page, limit);

    res.status(200).json({
      success: true,
      data: result.zones,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateZone = async (req, res) => {
  try {
    const updatedZone = await ZoneService.updateZone(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Zone updated successfully",
      data: updatedZone,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ===================== DELETE ZONE ===================== */
export const deleteZone = async (req, res) => {
  try {
    await ZoneService.deleteZone(req.params.id);

    res.status(200).json({
      success: true,
      message: "Zone deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};