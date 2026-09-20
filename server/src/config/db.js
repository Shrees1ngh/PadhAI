import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;

export const getDbStatus = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
};

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }

  const uri = ENV.MONGO_URI?.trim();
  if (!uri) {
    console.warn("⚠️  MongoDB URI not set in server/.env.");
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: "padhai",
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    console.warn(`👉 To enable persistence, ensure MongoDB is running or set MONGO_URI in server/.env`);
    return false;
  }
};

mongoose.connection.on("connected", () => {
  isConnected = true;
  console.log("📡 MongoDB connection established.");
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️  MongoDB connection disconnected.");
});
