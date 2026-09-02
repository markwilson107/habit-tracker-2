const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  role: {type: "user" | "admin" | "superadmin", required: true, default: "user"}
});

const User = mongoose.model("Users", userSchema);

module.exports = User;