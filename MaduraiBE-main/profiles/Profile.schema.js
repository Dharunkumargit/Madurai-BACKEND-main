import mongoose from "mongoose";

const profileschema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    
    password: { type: String, required: true }, // login ku
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileschema);