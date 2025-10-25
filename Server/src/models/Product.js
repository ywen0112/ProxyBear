const mongoose = require('mongoose');

/**
 * SubCategory 用于存放表单字段定义（非价格）
 * - 对于 IPv6，会有多个子类型（Bandwidth, Unlimited）
 */
const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },           // "Bandwidth" / "Unlimited"
  pricingType: { type: String, required: true },    // "perGB" / "throughput"
  formFields: [
    {
      key: { type: String, required: true },        // 参数名，例如 bandwidth / plan / speed
      label: { type: String, required: true },      // 显示文字
      type: { type: String, required: true },       // "integer" / "select"
      unit: { type: String, default: '' },          // 单位，例如 GB / Mbps / 天
      enum: [{ value: String, label: String }],     // 可选项（select用）
      required: { type: Boolean, default: true },
      help: { type: String, default: '' },
      min: { type: Number },
      step: { type: Number },
      showIf: {                                     // 条件显示（用于 IPv6 模式切换）
        key: { type: String },
        value: { type: mongoose.Schema.Types.Mixed }
      }
    }
  ]
});

/**
 * DirectPrice 用于 ISP 这种「固定单价/每IP」
 */
const directPriceSchema = new mongoose.Schema({
  priceType: { type: String, required: true },       // e.g. "perIP"
  pricePerUnit: { type: String, required: true },    // e.g. "IP"
  description: { type: mongoose.Schema.Types.Mixed, default: {} },
  visibleToGuest: { type: Boolean, default: true }
});

/**
 * 主产品模型（UI 展示配置 + 描述）
 */
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  formType: { type: String, enum: ['bandwidth', 'ipv6', 'isp'], required: true },
  description: { type: mongoose.Schema.Types.Mixed, default: {} },
  validRegions: [{ type: String }],                 // 仅 ISP 使用
  subCategories: { type: [subCategorySchema], default: [] },
  directPrices: { type: [directPriceSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
