const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricingType: { type: String, required: true },
  prices: [
    {
      size: { type: Number, required: true },
      price: { type: Number, required: true },
      visibleToGuest: { type: Boolean, default: false },
      description: { type: mongoose.Schema.Types.Mixed, default: {} }
    }
  ]
});

const directPriceSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  priceType: { type: String, required: true },
  pricePerUnit: { type: String, required: true },
  description: { type: mongoose.Schema.Types.Mixed, default: {} },
  visibleToGuest: { type: Boolean, default: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subCategories: { type: [subCategorySchema], default: [] },
  directPrices: { type: [directPriceSchema], default: [] },
  description: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
