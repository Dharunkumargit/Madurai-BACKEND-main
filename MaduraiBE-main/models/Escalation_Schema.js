import mongoose from "mongoose";

const escalationSchema = new mongoose.Schema(
  {
    binid: { type: String, required: true },
    ward: { type: String, required: true },
    zone: { type: String, required: true },
    engineer: { type: String, default: "Not Assigned" },
    escalationlevel: { type: String, default: "Level 1" },
  },
  { timestamps: true }
);

const Escalation = mongoose.model("Escalation", escalationSchema);

export default Escalation;