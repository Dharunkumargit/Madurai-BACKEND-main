import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    emp_id: { type: String },
    name: { type: String, required: true },

    phonenumber: { type: String, required: true, unique: true },
    emailid: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    designation: { type: String, required: true },
    status: { type: String, default: "Active" },
    zone: [{ type: String, default: [] }],
    ward: [{ type: String, default: [] }],
    role_name: { type: String, default: "" },
    role_id: { type: String, default: "" },
    password: { type: String },
    assignedZones: [{
    zone: { type: String, required: true },
    ward: { type: String, required: true },
    assignedDate: { type: Date, default: Date.now }
  }],
  performance: {
    totalTasksCompleted: { type: Number, default: 0 },
    totalGarbageCollected: { type: Number, default: 0 }, // in tons
    averageResponseTime: { type: Number, default: 0 }, // in minutes
    escalationsCount: { type: Number, default: 0 }
  }

  },
  { timestamps: true },
);
const Employee = mongoose.model("Employee", EmployeeSchema);
export default Employee;
