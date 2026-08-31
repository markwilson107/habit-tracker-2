const express = require("express");
const DailyEntry = require("../models/dailyEntry");

const router = express.Router();

router.get("/:date", async function (req, res) {
  try {
    const userId = req.userId;
    const date = req.params.date;

    const dailyEntry = await DailyEntry.findOne({
      userId: userId,
      date: date,
    });

    if (dailyEntry === null) {
      return res.json({ habits: [] });
    }

    res.json(dailyEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load daily entry" });
  }
});

router.patch("/update", async function (req, res) {
  try {
    const userId = req.userId;
    const date = req.body.date;
    const habitId = req.body.habitId;
    const completed = req.body.completed;

    let dailyEntry = await DailyEntry.findOne({
      userId: userId,
      date: date,
    });

    if (dailyEntry === null) {
      dailyEntry = await DailyEntry.create({
        userId: userId,
        date: date,
        habits: [],
      });
    }

    let found = false;
    for (let i = 0; i < dailyEntry.habits.length; i++) {
      if (dailyEntry.habits[i].habit.toString() === habitId) {
        dailyEntry.habits[i].completed = completed;
        found = true;
      }
    }

    if (!found) {
      dailyEntry.habits.push({ habit: habitId, completed: completed });
    }

    await dailyEntry.save();

    res.json(dailyEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update daily entry" });
  }
});

module.exports = router;
