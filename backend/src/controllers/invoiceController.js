import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";

const calculateTotal = (items = [], taxPercent = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = (subtotal * taxPercent) / 100;
  return Number((subtotal + tax).toFixed(2));
};

export const createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, customer, items, taxPercent, dueDate, status } = req.body;

    if (!invoiceNumber || !customer || !items?.length) {
      return res
        .status(400)
        .json({ message: "invoiceNumber, customer and at least one item are required" });
    }

    const customerExists = await Customer.findOne({ _id: customer, createdBy: req.user._id });
    if (!customerExists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const total = calculateTotal(items, taxPercent || 0);

    const invoice = await Invoice.create({
      invoiceNumber,
      customer,
      items,
      taxPercent: taxPercent || 0,
      total,
      dueDate,
      status,
      createdBy: req.user._id,
    });

    // Update product stocks
    for (const item of items) {
       // item.rate is price, item.quantity is quantity in some unit? 
       // In chay.html, we have packetQty and pieceQty. 
       // The Invoice model 'items' is { product, quantity, rate }.
       // We need to match the structure. 
       // For now, let's assume quantity is total packets (including piece fractional).
       await Product.findOneAndUpdate(
         { _id: item.product, createdBy: req.user._id },
         { $inc: { stock: -item.quantity } }
       );
    }

    return res.status(201).json(invoice);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Invoice number already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ createdBy: req.user._id })
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });
    return res.json(invoices);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate("customer", "name email phone address");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.json(invoice);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.customer) {
      const customerExists = await Customer.findOne({
        _id: payload.customer,
        createdBy: req.user._id,
      });
      if (!customerExists) {
        return res.status(404).json({ message: "Customer not found" });
      }
    }

    if (payload.items || payload.taxPercent !== undefined) {
      const existingInvoice = await Invoice.findOne({
        _id: req.params.id,
        createdBy: req.user._id,
      });
      if (!existingInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const items = payload.items || existingInvoice.items;
      const taxPercent = payload.taxPercent ?? existingInvoice.taxPercent;
      payload.total = calculateTotal(items, taxPercent);
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      payload,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.json(invoice);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Restore stocks for each item in the invoice
    for (const item of invoice.items) {
      if (item.product) {
        await Product.findOneAndUpdate(
          { _id: item.product, createdBy: req.user._id },
          { $inc: { stock: item.quantity } }
        );
      }
    }

    return res.json({ message: "Invoice deleted and stock restored" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
