import express from "express";
import {
  addPrediction,
  getPredictionsByBinId,
  getLatestPredictionByBinId
} from "../prediction/Prediction.controller.js";

const router = express.Router();

router.post("/add", addPrediction);
router.get("/getpredictionid", getPredictionsByBinId);
router.get("/binprediction", getLatestPredictionByBinId);

export default router;