import mongoose from "mongoose";

const WardSchema = new mongoose.Schema(
  {
    zonename: {
      type: String,
      required: true,
      trim: true,
    },
    wardname: {
      type: String,
      required: true,
      trim: true,
      unique: true, 
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

  },
  { timestamps: true }
);
WardSchema.index({ zonename: 1, wardname: 1 }, { unique: true });
const Ward = mongoose.model("Ward", WardSchema);
export default Ward;