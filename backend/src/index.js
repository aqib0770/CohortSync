import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const port = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
  });
});

app.use("/api/v1/user", userRoutes);

app.listen(port, () => {
  console.log("App listening on port", port);
});
