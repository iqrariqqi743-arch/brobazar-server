import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/user.route.js";
import adminRouter from "./routes/admin.route.js";
import homeSliderRoute from "./routes/homeSlider.route.js";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);

// Body parser
app.use(express.json());

// Cookies
app.use(cookieParser());

// Logger
app.use(morgan("dev"));

// Security
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// Home route
app.get("/", (request, response) => {
  response.json({
    message: "Server is running on port " + process.env.PORT,
  });
});

// User routes
app.use("/api/user", userRouter);

// Admin Routes
app.use("/api/admin", adminRouter);

// Home Slider
app.use("/api/home-slider", homeSliderRoute);

// Connect MongoDB first, then start server
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
