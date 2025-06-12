import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import csv from "csv-parser";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/utils.js";

const prisma = new PrismaClient();
const registerUsersCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const results = [];
  await fs
    .createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      results.push(row);
    })
    .on("end", async () => {
      for (const user of results) {
        const existingUser = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        });
        // console.log(existingUser);
        if (existingUser) {
          console.log(`User with email ${user.email} already exists`);
          continue;
        }
        const plainPassword = crypto.randomBytes(8).toString("hex");
        try {
          await prisma.user.create({
            data: {
              firstName: user.name.split(" ")[0],
              lastName: user.name.split(" ")[1] || null,
              email: user.email,
              passwordHash: await bcrypt.hash(
                plainPassword || "defaultPassword",
                10
              ),
            },
          });
          await sendMail(user.email, plainPassword, "showpassword");
        } catch (error) {
          console.log("Error in registering students", error);
        }
      }
      fs.unlinkSync(req.file.path);
      return res.json("file upload successfully");
    });
};

const updateProfile = async (req, res) => {};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.status(409).json({ message: "All fields are required" });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: "Invalid username or password" });
  }
  const isMatch = bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid username or password" });
  }
  const jwtData = {
    id: user.id,
    name: user.firstName,
  };
  const token = jwt.sign(jwtData, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  };
  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
    },
  });
};
const logoutUser = async (req, res) => {
  res.cookie("token", undefined);
  res.status(200).json({
    success: true,
    message: "Logged out succeccfully",
  });
};
const getProfile = async (req, res) => {
  const { userId } = req.user.id;
  if (!userId) {
    console.log("User not found");
  }
  const user = prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      passwordHash: true,
      linkedInUrl: true,
      XUrl: true,
      PeerlistUrl: true,
      githubUsername: true,
    },
  });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  res.status(200).json({
    success: true,
    user,
  });
};

export { registerUsersCSV, loginUser, logoutUser, getProfile };
