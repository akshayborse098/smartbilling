import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";

export const createPurchase = async (req, res) => {
  try {
    const { supplierName, items, total } = req.body;

    if (!supplierName || !items?.length) {
      return res.status(400).json({ message: "supplierName and items are required" });
    }

    const purchase = await Purchase.create({
      supplierName,
      items,
      total,
      createdBy: req.user._id,
    });

    // Automatically update product stock
    for (const item of items) {
      await Product.findOneAndUpdate(
        { name: item.name, createdBy: req.user._id },
        { $inc: { stock: item.packetQty } }
      );
    }

    return res.status(201).json(purchase);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    return res.json(purchases);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findOneAndDelete({ _id: id, createdBy: req.user._id });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Optionally rollback stock updates
    for (const item of purchase.items) {
      await Product.findOneAndUpdate(
        { name: item.name, createdBy: req.user._id },
        { $inc: { stock: -item.packetQty } }
      );
    }

    return res.json({ message: "Purchase deleted and stock updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
