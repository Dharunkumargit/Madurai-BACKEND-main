import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    image_url: String,
    fill_level: { type: Number, default: 0 },
  },
  { _id: false },
);

const binSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true },
    ward: { type: String, required: true },
    street: { type: String, required: true },

    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },

    bintype: { type: String, required: true },

    // 🔥 FIXED → must be Number
    capacity: { type: Number, required: true },

    filled: { type: Number, default: 0 },

    binid: { type: String, unique: true, required: true },

    location: {type: String},

    status: {
      type: String,
      enum: ["Active", "Inactive" , "Full"],
      default: "Active",
    },

    history: [historySchema],

    lastReportedAt: Date,

    lastCollectedAt: Date,

    // // ✅ Metrics
    // clearedCount: { type: Number, default: 0 },
    // totalClearedAmount: { type: Number, default: 0 }, // kg
    // totalClearTimeMins: { type: Number, default: 0 },
    // avgClearTimeMins: { type: Number, default: 0 },
    lastFullAt: Date,
    lastClearedAt: Date,
    
    escalation: {
      thresholdsHit: {    // 75%, 90%, 100%
        '75%': { time: Date, notified: [String] },
        '90%': { time: Date, notified: [String] },
        '100%': { time: Date, notified: [String] }
      },
      timeEscalations: [{ // L1, L2, L3, L4
        level: String,
        role: String,
        notifiedAt: Date
      }],
      status: { 
        type: String, 
        enum: ['normal', '75%', '90%', '100%', 'L1', 'L2', 'L3', 'L4'],
        default: 'normal'
      },
      acknowledgedBy: String,
      acknowledgedAt: Date
    }
  },
  { timestamps: true },
);

export default mongoose.model("Bin", binSchema);
