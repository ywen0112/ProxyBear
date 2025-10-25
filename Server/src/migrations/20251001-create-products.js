/**
 * Migration: Create or refresh product definitions
 * Safe version — auto-replaces same-name documents, removes invalid ones
 */

const { MongoClient } = require("mongodb");

async function run(client) {
  const db = client.db("ProxyBear");
  const collectionName = "products";
  const productsCollection = db.collection(collectionName);

  // 确保集合存在
  await db.createCollection(collectionName).catch(() => {});
  await productsCollection.createIndex({ name: 1 }, { unique: true });

  // 清理无效产品（只删除非指定类别）
  const validCategories = ["Residential", "Mobile", "IPv6", "ISP"];
  const deleteResult = await productsCollection.deleteMany({
    category: { $nin: validCategories },
  });
  console.log(
    deleteResult.deletedCount > 0
      ? `已删除 ${deleteResult.deletedCount} 个旧产品 (非 ${validCategories.join(", ")})`
      : "无旧产品需要删除"
  );

  const validRegionsArray = [
    "virm","dtag","juic","vocu","dtag_nl","pol","bra","lva","fra","rou",
    "can","nor","aut","ukr","tur","jpn","isr","twn","kor","esp","sgp",
    "hkn","tha","ind","ita"
  ];

  // ------------------- Residential -------------------
  const residential = {
    name: "住宅代理",
    category: "Residential",
    formType: "bandwidth",
    description: {
      short: "住宅代理",
      long: "高速、可靠的住宅代理，适合需要稳定住宅IP的用户。",
      long2: "高效、实惠，旨在提供快速、安全的连接。",
      features: ["全球多个地点，保证高性能。", "灵活的流量计费模式。"],
    },
    subCategories: [
      {
        name: "Bandwidth",
        pricingType: "perGB",
        formFields: [
          {
            key: "bandwidth",
            label: "带宽 (GB)",
            type: "integer",
            unit: "GB",
            required: true,
            help: "请输入正整数，例如 1、2、3...",
            min: 1,
            step: 1,
          },
        ],
      },
    ],
  };

  // ------------------- Mobile -------------------
  const mobile = {
    name: "移动代理",
    category: "Mobile",
    formType: "bandwidth",
    description: {
      short: "移动代理",
      long: "覆盖 50+ 国家/地区的移动 IP 池。",
      long2: "适合高安全 Web 抓取、广告验证、社交媒体运营。",
      features: [
        "500k+ 实时移动节点",
        "支持国家 & ISP 定向",
        "支持 HTTP/SOCKS5 协议",
      ],
    },
    subCategories: [
      {
        name: "Bandwidth",
        pricingType: "perGB",
        formFields: [
          {
            key: "bandwidth",
            label: "带宽 (GB)",
            type: "integer",
            unit: "GB",
            required: true,
            help: "仅允许正整数，例如 1、2、3...",
            min: 1,
            step: 1,
          },
        ],
      },
    ],
  };

  // ------------------- IPv6 -------------------
  const ipv6 = {
    name: "IPv6 代理",
    category: "IPv6",
    formType: "ipv6",
    description: {
      short: "IPv6 代理",
      long: "支持按流量或不限速率两种方式购买。",
      long2: "提供数十亿 IPv6 地址，确保爬虫更快、更稳定。",
      features: ["2x /29 网络 IP 池", "支持 HTTP/SOCKS5 协议", "国家定向 + 轮换模式"],
    },
    subCategories: [
      {
        // Bandwidth 改为 select：枚举固定档位
        name: "Bandwidth",
        pricingType: "perGB",
        formFields: [
          {
            key: "bandwidth",
            label: "选择带宽包",
            type: "select",
            unit: "GB",
            required: true,
            enum: [
              { value: "100",   label: "100 GB" },
              { value: "250",   label: "250 GB" },
              { value: "500",   label: "500 GB" },
              { value: "1000",  label: "1000 GB" },
              { value: "3000",  label: "3000 GB" },
              { value: "5000",  label: "5000 GB" },
              { value: "10000", label: "10000 GB" },
            ],
            help: "IPv6 按流量只能选择固定档位",
          },
        ],
      },
      {
        name: "Unlimited",
        pricingType: "throughput",
        formFields: [
          {
            key: "plan",
            label: "计划天数",
            type: "select",
            enum: [
              { value: "1", label: "1 天" },
              { value: "7", label: "7 天" },
              { value: "30", label: "30 天" },
            ],
          },
          {
            key: "speed",
            label: "速率 (Mbps)",
            type: "select",
            unit: "Mbps",
            enum: [
              { value: "30", label: "30 Mbps" },
              { value: "60", label: "60 Mbps" },
              { value: "120", label: "120 Mbps" },
              { value: "200", label: "200 Mbps" },
            ],
          },
        ],
      },
    ],
  };

  // ------------------- ISP -------------------
  const isp = {
    name: "ISP 代理",
    category: "ISP",
    formType: "isp",
    description: {
      short: "ISP 代理",
      long: "高速稳定的 ISP 专用代理，提供固定住宅级 IP。",
      long2: "覆盖欧洲、亚洲和北美多个地区，支持多种协议。",
      features: [
        "固定 ISP 住宅 IP，提升信任度与安全性",
        "支持 HTTP/SOCKS5 协议",
        "适合广告验证、电商、SEO 场景",
      ],
    },
    validRegions: validRegionsArray,
    subCategories: [
      {
        name: "ISP",
        pricingType: "perIP",
        formFields: [
          {
            key: "ip",
            label: "IP 数量",
            type: "select",
            enum: [
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
            ],
          },
          {
            key: "region",
            label: "地区",
            type: "select",
            enum: validRegionsArray.map((r) => ({
              value: r,
              label: r.toUpperCase(),
            })),
            help: "选择地区，价格不随地区变化",
          },
        ],
      },
    ],
  };

  // ✅ 插入或更新产品（按 name 匹配，避免重复）
  const products = [residential, mobile, ipv6, isp];
  for (const p of products) {
    await productsCollection.updateOne(
      { name: p.name }, // 改成用 name 匹配
      { $set: p },
      { upsert: true }
    );
    console.log(`Product "${p.name}" (${p.category}) 已更新或创建`);
  }

  console.log("所有产品已同步完成！");
}

module.exports = { run, name: "20251001-create-products" };
