const express = require("express");
const Habit = require("../models/habitsModel");

const router = express.Router();

router.get("/", async function (req, res) {
  try {
    const userId = req.userId;

    const habits = await Habit.find({ userId: userId });
    res.json(habits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load habits" });
  }
});

router.post("/add", async function (req, res) {
  try {
     const userId = req.userId;

    const habit = await Habit.create({
      userId: userId,
      name: req.body.name,
      description: req.body.description,
      icon: req.body.icon,
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create habit" });
  }
});

router.patch("/update", async function (req, res) {
  try {
     const userId = req.userId;
    const habitId = req.body.id;

    const name = req.body.name;
    const description = req.body.description;
    const icon = req.body.icon;

    const habit = await Habit.findOneAndUpdate(
      {
        _id: habitId,
        userId: userId,
      },
      {
        name: name,
        description: description,
        icon: icon,
      },
      { new: true, runValidators: true },
    );

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update habit" });
  }
});

router.delete("/delete", async function (req, res) {
  try {
    const userId = req.userId;
    const habitId = req.body.habitId;

    const habit = await Habit.findOneAndDelete({
      _id: habitId,
      userId: userId,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete habit" });
  }
});

module.exports = router;
