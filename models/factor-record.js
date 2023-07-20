const mongoose = require("mongoose");

const FactorRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  factor: { type: mongoose.Schema.Types.ObjectId, ref: "Factor" },
  value: { type: String },
  unit: { type: String, maxlength: 20 },
  start_at: { type: Date },
  end_at: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("factor-record", FactorRecordSchema);
