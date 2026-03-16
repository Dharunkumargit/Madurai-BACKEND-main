import express from "express";
import { createWard, deleteWard, getWardReport, getWards, updateWard } from "../ward/Ward.controller.js";

const router = express.Router();

router.post("/createward", createWard);
router.get("/getwards", getWards);
router.get("/getwardreport", getWardReport)
router.put("/updateward/:id", updateWard);
router.delete("/deleteward/:id", deleteWard);

export default router;