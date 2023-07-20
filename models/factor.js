const mongoose = require("mongoose");

const FactorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String },
  icon_source: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("factor", FactorSchema);
