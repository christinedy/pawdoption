import express from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

// --------------------- Helper ---------------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// --------------------- Register ---------------------
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { fullname, email, phone, address, password, role } = req.body;

    if (!fullname || !email || !phone || !address || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email is already used" });

    const user = new User({ fullname, email, phone, address, password, role });
    await user.save();

    res.status(201).json({
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user),
    });
  })
);

// --------------------- Login ---------------------
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Please provide email and password" });

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  })
);

// --------------------- Forgot Password ---------------------
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please provide your email" });

    const user = await User.findOne({ email });
    if (!user) {
      // Avoid email enumeration
      return res.status(200).json({ message: "If an account exists, a reset email has been sent." });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <p>You requested to reset your password.</p>
      <p>Click the link below:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>This link expires in <strong>10 minutes</strong>.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "PAWdoption Password Reset",
        html,
      });

      res.json({ message: "Reset link sent to email" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error(error);
      res.status(500).json({ message: "Email could not be sent" });
    }
  })
);

// --------------------- Reset Password ---------------------
router.post(
  "/reset-password/:token",
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Please provide a new password" });

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Token invalid or expired" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  })
);

export default router;