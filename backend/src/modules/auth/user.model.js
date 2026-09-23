import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    passwordHash: {
      type: String,
      // Optional for Google OAuth authenticated accounts
      required: function () {
        return this.authProvider === "local";
      },
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify candidate password with bcrypt
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Transform to clean JSON without exposing sensitive password hash
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj._id) {
    obj.id = obj._id.toString();
  }
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
