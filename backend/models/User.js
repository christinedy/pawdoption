// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Counter from "./counter.js"; // <--- 1. Import the Counter model

const userSchema = new mongoose.Schema(
  {
    // This is where the auto-incremented ID will live
    userID: { type: Number, unique: true },

    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["adopter", "admin"],
      default: "adopter",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// 2. THE MAGIC: Auto-increment logic before saving
userSchema.pre("save", async function () {
  const user = this;

  // Only generate a userID if this is a NEW user
  if (user.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "userID" }, // The name of the counter
      { $inc: { seq: 1 } }, // Increment by 1
      { new: true, upsert: true } // Create the counter if it doesn't exist
    );
    user.userID = counter.seq;
  }
  
  // Proceed to password hashing logic
  if (!user.isModified("password")) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    
  } catch (error) {
    next(error);
  }
});

// COMPARE PASSWORDS DURING LOGIN
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// GENERATE PASSWORD RESET TOKEN
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;