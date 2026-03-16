import express from "express";
import { createZone, deleteZone, getZones, updateZone } from "../zone/Zone.controller.js";

const router = express.Router();

router.post("/createzone", createZone);
router.get("/getzones", getZones);
router.put("/updatezone/:id", updateZone);

/* DELETE ZONE */
router.delete("/deletezonebyid/:id", deleteZone);

export default router;