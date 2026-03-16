import Prediction from "../prediction/Prediction.schema.js";

/* ================= CREATE PREDICTION ================= */
export const createPrediction = async (data) => {
  return await Prediction.create(data);
};

/* ================= GET BY BIN ID ================= */
export const getPredictionsByBinId = async (bin_id) => {
  return await Prediction.find({ bin_id }).sort({ created_at: -1 });
};

/* ================= GET LATEST BY BIN ID ================= */
export const getLatestPredictionByBinId = async (bin_id) => {
  return await Prediction.findOne({ bin_id }).sort({ created_at: -1 });
};