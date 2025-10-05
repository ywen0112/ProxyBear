const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('user subUser product');
    res.json(transactions);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const addProduct = async (req, res) => {
  const { name, price, description } = req.body;
  try {
    const product = await Product.create({ name, price, description });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getAllUsers, getAllTransactions, addProduct };