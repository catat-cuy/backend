// Local DB //
// const db = require("../../models");
// const User = db.users;

const User = require("../../models/user.model");
const passwordUtil = require("../../utils/password.util");
const tokenUtils = require("../../utils/token.util");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) {
    return res.status(400).json({ error: true, message: "Name is required" });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res
      .status(400)
      .json({ error: true, message: "Email already exists" });
  }

  const user = new User({
    name,
    email,
    password: await passwordUtil.encrypt(req.body.password),
  });

  await user.save();

  const token = await tokenUtils.encode(user);

  return res.status(201).json({
    success: true,
    user,
    token,
    message: "User registered successfully",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const checkUser = await passwordUtil.compare(password, user.password);
  if (!checkUser) {
    return res.status(401).json({ message: "Password Incorrect" });
  }

  const token = await tokenUtils.encode(user);
  return res.json({
    error: false,
    message: "Login Successful",
    email: email,
    token: token,
  });
};

module.exports = { register, login };
