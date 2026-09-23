import mongoose from "mongoose";
import dns from "dns";
import { ENV } from "./env.js";

// Ensure Node DNS resolver uses public DNS servers to resolve MongoDB Atlas SRV records properly on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

let isConnected = false;
let reconnectTimeout = null;

export const getDbStatus = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
};

export const isDbReady = () => {
  return mongoose.connection.readyState === 1;
};

const scheduleReconnect = (delayMs = 10000) => {
  if (reconnectTimeout) return;
  reconnectTimeout = setTimeout(async () => {
    reconnectTimeout = null;
    if (mongoose.connection.readyState === 0) {
      console.log("🔄 Retrying MongoDB connection in background...");
      await connectDB();
    }
  }, delayMs);
  if (reconnectTimeout?.unref) {
    reconnectTimeout.unref();
  }
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
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isConnected = true;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    if (error.message && error.message.includes("whitelist")) {
      console.warn(`👉 Atlas IP Whitelist required: Add your current IP (or 0.0.0.0/0) in MongoDB Atlas -> Network Access.`);
    }
    // Schedule background retry so it automatically connects when IP is whitelisted or network recovers
    scheduleReconnect(10000);
    return false;
  }
};

mongoose.connection.on("connected", () => {
  isConnected = true;
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  console.log("📡 MongoDB connection established.");
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️  MongoDB connection disconnected.");
  scheduleReconnect(10000);
});


