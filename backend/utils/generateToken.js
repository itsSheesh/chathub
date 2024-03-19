import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const generateWebToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "20d",
  });
  res.cookie("jwt", token, {
    maxAge: 20 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development"
  });
};
export default generateWebToken;
