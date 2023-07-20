const mongoose = require("mongoose");

const SleepSummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  self_assessment: { type: int },
  latency: { type: int },
  duration: { type: int },
  efficiency: { type: int },
  in_bed_at: { type: Date },
  sleep_at: { type: Date },
  wakeup_at: { type: Date },
  wakeup_time: { type: int },
  overall_score: { type: int },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("sleep-summary", SleepSummarySchema);
