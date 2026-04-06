import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { name, price, pieces, stock } = req.body;

    if (!name || isNaN(price) || isNaN(pieces)) {
      return res.status(400).json({ message: "name, price and pieces are required" });
    }

    const product = await Product.create({
      name,
      price,
      pieces,
      stock: stock || 0,
      createdBy: req.user._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Product name already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id }).sort({ name: 1 });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, price, pieces, stock } = req.body;
    const { id } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { name, price, pieces, stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, createdBy: req.user._id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const bulkSyncProducts = async (req, res) => {
  try {
    const { products } = req.body; // Map of name -> { price, pieces, stock }
    const results = [];
    
    for (const [name, data] of Object.entries(products)) {
        const product = await Product.findOneAndUpdate(
            { name, createdBy: req.user._id },
            { 
               name, 
               price: data.price, 
               pieces: data.pieces, 
               stock: data.stock 
            },
            { upsert: true, new: true }
        );
        results.push(product);
    }
    
    return res.json({ message: "Sync successful", count: results.length });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
