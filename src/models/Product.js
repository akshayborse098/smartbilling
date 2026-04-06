import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    pieces: {
      type: Number,
      required: true,
      min: 1,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can't have duplicate product names
productSchema.index({ createdBy: 1, name: 1 }, { unique: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
