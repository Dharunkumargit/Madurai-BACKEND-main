import express from "express";
import { updateUserProfile } from "../profiles/Profile.controller.js";

const router = express.Router();

router.put("/update/:id", updateUserProfile);

export default router;