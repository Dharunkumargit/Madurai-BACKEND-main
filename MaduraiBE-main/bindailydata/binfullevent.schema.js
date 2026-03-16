import mongoose from "mongoose";

const BinFullEventSchema = new mongoose.Schema({
  binid: { type: String, required: true },
  zone: String,
  ward: String,
  
  // Daily date
  date: { type: Date, required: true }, // Start of day
  
  // Events (multiple fill/clear per day)
  events: [{
    fillTime: { type: Date, required: true },
    fillLevel: { type: Number, required: true },
    capacity: { type: Number, required: true },
    imageUrl: String,
    clearedTime: Date,
    clearTimeMins: Number
  }],
  
  // Daily analytics
  analytics: {
    fullEvents: { type: Number, default: 0 },
    clearedEvents: { type: Number, default: 0 },
    totalCapacityLiters: { type: Number, default: 0 },
    totalTonnageCleared: { type: Number, default: 0 }, // tons
    totalClearTimeMins: { type: Number, default: 0 },
    avgClearTimeMins: Number,
    firstFullTime: Date,
    lastFullTime: Date,
    consecutiveDaysFull: { type: Number, default: 0 }
  }
}, { timestamps: true });

BinFullEventSchema.index({ binid: 1, date: 1 }, { unique: true, sparse: true });
export default mongoose.model('BinFullEvent', BinFullEventSchema);

