const {
  getProducts,
  getAllProducts,
  purchaseUserProduct
} = require("../maintenance/productMaintenance");

const listProducts = async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const listAllProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const purchaseProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user.id;
    const transaction = await purchaseUserProduct(productId, buyerId);
    res.json({ message: "Purchase successful", transaction });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { listProducts, listAllProducts, purchaseProduct };
