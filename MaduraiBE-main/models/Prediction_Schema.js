import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
  binid: String,
  fill_level: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Prediction", predictionSchema);