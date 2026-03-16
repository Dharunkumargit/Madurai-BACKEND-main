import express from "express";
import {
    changePasswordController,
  createEmployee,
  deleteEmployee,
  getEmployeeReport,
  getEmployees,
  login,
  logout,
  updateEmployee,
  updateuser,
} from "../controllers/Employee_controller.js";

const router = express.Router();

// Public: Create basic employee
router.post("/createemployee", createEmployee);

// Auth endpoints
router.post("/login", login);
router.post("/logout", logout);

router.put("/updateuser/:id", updateuser);
router.put("/changepassword/:id", changePasswordController);

// Protected endpoints (session required)
router.get("/getemployees", getEmployees);
router.get("/employeereport", getEmployeeReport);
router.put("/updateemployee/:id", updateEmployee);
router.delete("/deleteemployee/:id", deleteEmployee);



export default router;
