const mongoose = require("mongoose");

const dailyHabitSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habits",
    required: true
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const dailyEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  habits: [dailyHabitSchema],
});

dailyEntrySchema.index({ username: 1, date: 1})

const DailyEntry = mongoose.model("DailyEntry", dailyEntrySchema);

module.exports = DailyEntry;