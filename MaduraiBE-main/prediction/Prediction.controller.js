import * as PredictionService from "../prediction/Prediction.service.js";

/* ================= ADD PREDICTION ================= */
export const addPrediction = async (req, res) => {
  try {
    const prediction = await PredictionService.createPrediction(req.body);

    res.status(201).json({
      success: true,
      message: "Prediction added successfully",
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= GET ALL BY BIN ID ================= */
export const getPredictionsByBinId = async (req, res) => {
  try {
    const { bin_id } = req.params;

    const predictions =
      await PredictionService.getPredictionsByBinId(bin_id);

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= GET LATEST BY BIN ID ================= */
export const getLatestPredictionByBinId = async (req, res) => {
  try {
    const { bin_id } = req.params;

    const prediction =
      await PredictionService.getLatestPredictionByBinId(bin_id);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: "No prediction found for this bin"
      });
    }

    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};