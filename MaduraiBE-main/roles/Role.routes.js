import express from "express";
import { createRole, deleteRole, getAllRoles, getRoleById,  updateRole,   } from "../roles/Role.controller.js";


const router = express.Router();

router.post("/addrole", createRole);
router.get("/getroles", getAllRoles);
router.get("/getrolebyid/:roleId", getRoleById);
router.put("/updaterolebyid", updateRole);
router.delete("/deleterolebyid/:id", deleteRole);


export default router;