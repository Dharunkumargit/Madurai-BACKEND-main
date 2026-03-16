import mongoose from "mongoose";

const PredictionSchema = new mongoose.Schema(
  {
    bin_id: {
      type: String,
      required: true,
      index: true
    },

    timestamp: {
      type: String, // "2025-12-17T17-15-35"
      required: true
    },

    image_url: {
      type: String,
      required: true
    },

    fill_level: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    }
  }
);

export default mongoose.model("Prediction", PredictionSchema);