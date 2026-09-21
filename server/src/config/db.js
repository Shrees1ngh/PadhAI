import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;

export const getDbStatus = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
};

export const isDbReady = () => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }

  const uri = ENV.MONGO_URI?.trim();
  if (!uri) {
    console.warn("⚠️  MongoDB URI not set in server/.env. Running with in-memory store.");
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: "padhai",
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    console.warn(`👉 Using resilient in-memory storage fallback for seamless development.`);
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

