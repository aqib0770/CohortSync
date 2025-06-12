import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const isLoggedIn = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(409).json({
      error: "Invalid token",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Error in middleware", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
