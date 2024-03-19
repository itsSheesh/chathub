import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateWebToken from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, userName, password, confirmPassword, gender } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords Do Not match" });
    }
    if (password.length < 8) {
      return res.status(400).json({error: "Password must be at least 8 characters" });
    }
    const user = await User.findOne({ userName });
    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }
    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`;

    const newUser = new User({
      fullName,
      userName,
      password: hashPassword,
      gender,
      profilePic : gender === "male" ? boyProfilePic : girlProfilePic
    });
    if (newUser) {
      generateWebToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        profilePic: newUser.profilePic,
        bio: ""
      });
    }
  } catch (error) {
    res.status(500).json({ error: "User Not Created!" });
  }
};

export const login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne({ userName: userName });
    const isValidPassword = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user) {
      return res.status(400).json({ error: "Invalid username" });
    }
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    generateWebToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      profilePic: user.profilePic,
      bio: user.bio
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Can't logout User" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { userName, password } = req.query;
    const user = await User.findOne({ userName });
    const isValidPassword = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isValidPassword) {
      res.status(401).json({ message: "Invalid username or password" });
    }
    await User.deleteOne({ userName });
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Account has been deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// http://localhost:5000/api/auth/delete?userName=test1234&password=test1234