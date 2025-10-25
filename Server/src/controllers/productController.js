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
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("[listAllProducts] Error:", err);
    res.status(500).json({
      success: false,
      message: "无法获取产品列表",
      error: err.message,
    });
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
