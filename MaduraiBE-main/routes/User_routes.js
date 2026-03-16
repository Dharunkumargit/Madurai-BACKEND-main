import express from "express";
import { addUser, changePassword, getUser, loginUser, removeUser, updateUser } from "../controllers/User_controller.js";




const router = express.Router();

router.post("/createuser", addUser);
router.post("/login", loginUser);
router.get("/getuser", getUser);

router.put("/updateuserbyid/:id", updateUser);
router.delete("/deleteuserbyid/:id", removeUser);
router.put("/changepassword/:id", changePassword);


export default router;