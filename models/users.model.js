import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dxjv0gq4f/image/upload/v1690911875/avatar/default-avatar_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1.png",
    },

    mobile: {
      type: Number,
      default: null,
    },
    verify_email: {
      type: Boolean,
      default: false,
    },

    access_token: {
      type: String,
      default: null,
    },

    refresh_token: {
      type: String,
      default: null,
    },

    last_login_date: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    address_details: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address",
      },
    ],
    order_history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
      },
    ],

    otp: {
      type: String,
      default: null,
    },

    otp_expiry: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    sing_up_with_google: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("user", userSchema);

export default User;
