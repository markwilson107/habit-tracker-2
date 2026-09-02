const express = require("express");
const connectDatabase = require("./config/database");
const habitRoutes = require("./routes/habitRoutes");
const dailyEntryRoutes = require("./routes/dailyEntryRoutes");
const authRoutes = require("./routes/authRoutes");
const requireAuth = require("./middleware/requireAuth");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function startApp() {
  try {
    await connectDatabase();

    app.use("/api/auth", authRoutes);
    app.use("/api/habits", requireAuth, habitRoutes);
    app.use("/api/dailyEntry", requireAuth, dailyEntryRoutes);

    app.get("/api/health", function (req, res) {
      res.send("Habit Tracker API is healthy");
    });

    app.listen(PORT, function () {
      console.log(`App listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start server:", error);
  }
}

startApp();
