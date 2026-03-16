import express from "express";

import {
  
  getAllBins,
  getBin,
  updateBin,
  deleteBin,
  createBin,
  getBinReport,
} from "../bins/Bin.controller.js";

const router = express.Router();

router.post("/createbin", createBin);
router.get("/getallbins", getAllBins);
router.get("/getbinsbyid/:id", getBin);
router.put("/updatebinsbyid/:id", updateBin);
router.delete("/deletebinbyid/:id", deleteBin);
router.get("/getbinreport", getBinReport);

export default router;