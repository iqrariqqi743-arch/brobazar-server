import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in the environment variables",
      );
    }

    console.log("Connecting to MongoDB...");

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(
      `MongoDB connected successfully: ${connection.connection.host}`,
    );
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;
