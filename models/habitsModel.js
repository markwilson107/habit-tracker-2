const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: "H" },
});

habitSchema.index({ username: 1 });

const Habit = mongoose.model("Habits", habitSchema);

module.exports = Habit;