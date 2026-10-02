import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product_id: {
          type: String,
        },
        product_title: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
        image: {
          type: String,
        },
        sub_total: {
          type: Number,
        },
      },
    ],
    payment_id: {
      type: String,
      default: "",
    },
    payment_status: {
      type: String,
      default: "",
    },

    order_status: {
      type: String,
      default: "confirmed",
    },

    delivery_address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    total_amount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
