const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const getProducts = async () => {
  const products = await Product.find().lean();

  return products.map(product => {
    const directPrices = (product.directPrices || []).filter(p => p.visibleToGuest);

    const subCategories = (product.subCategories || []).map(sub => ({
      ...sub,
      prices: (sub.prices || []).filter(p => p.visibleToGuest)
    }));

    const mainPrice = directPrices.length > 0
      ? directPrices[0]
      : subCategories.length > 0 && subCategories[0].prices.length > 0
        ? subCategories[0].prices[0]
        : null;

    return {
      _id: product._id,
      name: product.name,
      description: {
        short: product.description?.short || "",
        long: product.description?.long || "",
        long2: product.description?.long2 || "",
        features: Array.isArray(product.description?.features)
          ? product.description.features
          : []
      },
      createdAt: product.createdAt,
      price: mainPrice ? mainPrice.price : null,
      priceType: mainPrice ? mainPrice.type : "",
      pricePerUnit: mainPrice ? mainPrice.perUnit : ""
    };
  });
};

const getAllProducts = async () => {
  const products = await Product.find().lean();

  return products.map(product => ({
    _id: product._id,
    name: product.name,
    description: {
      short: product.description?.short || "",
      long: product.description?.long || "",
      long2: product.description?.long2 || "",
      features: Array.isArray(product.description?.features)
        ? product.description.features
        : typeof product.description?.features === "string"
          ? product.description.features.split("\n")
          : []
    },
    createdAt: product.createdAt,
    price: product.price || null,
    directPrices: product.directPrices || [],
    subCategories: product.subCategories || []
  }));
};

const purchaseUserProduct = async (productId, buyerId) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  const buyer = await User.findById(buyerId);
  let mainUser = buyer;
  if (buyer.role === "sub") {
    mainUser = await User.findById(buyer.parent);
  }

  if (mainUser.credit < product.price) {
    throw new Error("Insufficient credit");
  }

  mainUser.credit -= product.price;
  await mainUser.save();

  const transaction = await Transaction.create({
    type: "purchase",
    amount: product.price,
    user: mainUser._id,
    subUser: buyer.role === "sub" ? buyer._id : null,
    product: productId,
    status: "completed",
  });

  return transaction;
};

module.exports = { getProducts, getAllProducts, purchaseUserProduct };
