const User = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config/env");

const TOKEN_TTL_MS = 5 * 60 * 60 * 1000; // 5 hours, same as the JWT expiry

const cookieOptions = {
  httpOnly: true, // not readable by JavaScript, so an XSS bug can't steal the token
  secure: config.cookieSecure,
  sameSite: config.cookieSameSite,
  path: "/",
};

// Compared against when the email is unknown, so login timing doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

const publicUser = (user) => ({ id: user._id, name: user.Name, email: user.Email });

const signup = async (req, res) => {
  try {
    const { Name, Email, Password } = req.body;

    const existing = await User.findOne({ Email });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hashPassword = await bcrypt.hash(Password, 10);
    await User.create({ Name, Email, Password: hashPassword });

    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }
    console.error("Signup error:", error.message);
    return res.status(500).json({ success: false, message: "Could not create account" });
  }
};

const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const user = await User.findOne({ Email });
    const passwordOk = await bcrypt.compare(Password, user ? user.Password : DUMMY_HASH);

    // One generic message for both "no such user" and "wrong password".
    if (!user || !passwordOk) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: "5h", algorithm: "HS256" });
    res.cookie("token", token, { ...cookieOptions, maxAge: TOKEN_TTL_MS });

    return res.status(200).json({ success: true, user: publicUser(user), message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: "Could not log in" });
  }
};

// Used by the frontend to find out whether the visitor is logged in.
const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.clearCookie("token", cookieOptions);
      return res.status(401).json({ success: false, message: "Please log in to continue" });
    }
    return res.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error("Me error:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.status(200).json({ success: true, message: "Logged out" });
};

module.exports = { signup, login, me, logout };
