import express from "express";
import multer from "multer";
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUsersCSV,
} from "../controllers/auth.controllers.js";
import { isAdmin, isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/register",
  upload.single("file"),
  isLoggedIn,
  isAdmin,
  registerUsersCSV
);
router.post("/login", loginUser);
router.get("/profile", isLoggedIn, getProfile);
router.get("/logout", isLoggedIn, logoutUser);

export default router;
