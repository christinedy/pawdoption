import User from "./models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Needed for resetPassword

// --- Helper: Generate JWT Token ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// --- Register User ---
export const registerUser = async (req, res) => {
  try {
    // 1. Debugging Log: See exactly what the frontend sent
    console.log("Register Request Body:", req.body);

    // 2. Destructure ALL fields
    const { fullname, email, phone, address, password } = req.body;

    // 3. Validation: Ensure no fields are empty
    if (!fullname || !email || !phone || !address || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // 4. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 5. Create User
    // User.create triggers the .pre('save') hook, which generates the displayId and hashes the password.
    const user = await User.create({
      fullname,
      email,
      phone,  
      address, 
      password,
    });

    // 6. Send Success Response, including the newly generated displayId
    if (user) {
      res.status(201).json({
        _id: user._id,
        displayId: user.displayId, // <--- ADDED: Return sequential ID
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error); 
    // Return the actual error message so you can see it in the frontend alert
    res.status(500).json({ message: error.message });
  }
};

// --- Login User ---
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email (we need to select the password explicitly since it has select: false)
    const user = await User.findOne({ email }).select('+password');

    // 2. Check password (using the method in your User model)
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        displayId: user.displayId, // <--- ADDED: Return sequential ID
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash token to compare with DB (same logic as in forgot-password)
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with matching token AND token not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password has been updated successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};