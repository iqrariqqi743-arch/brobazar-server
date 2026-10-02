import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    address_line1: {
      type: String,
      required: true,
    },
    address_line2: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
    },
    country: {
      type: String,
    },
    mobile_number: {
      type: Number,
      default: null,
    },
    selected: {
      type: String,
      default: true,
    },
    landmark: {
      type: String,
      default: null,
    },
    address_type: {
      type: String,
      enum: ["Home", "Office"],
      default: "Home",
    },
    user_id: {
      type: String,
      ref: "User",
    },
  },
  { timestamps: true },
);

const AddressModel = mongoose.model("Address", addressSchema);

export default AddressModel;
