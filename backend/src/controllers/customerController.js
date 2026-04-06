import Customer from "../models/Customer.js";

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      createdBy: req.user._id,
    });

    return res.status(201).json(customer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json({ message: "Customer deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
