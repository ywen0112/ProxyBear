const { MongoClient } = require('mongodb');

async function run(client) {
  const db = client.db('ProxyBear');
  const collectionName = 'products';

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName);
    console.log(`Collection ${collectionName} created`);
  } else {
    console.log(`Collection ${collectionName} already exists`);
  }

  const productsCollection = db.collection(collectionName);

  // Indexes
  try {
    await productsCollection.createIndex({ name: 1 }, { unique: true });
    await productsCollection.createIndex({ category: 1 });
    await productsCollection.createIndex({ createdAt: 1 });

    await productsCollection.createIndex({ 'subCategories.name': 1 });
    await productsCollection.createIndex({ 'subCategories.pricingType': 1 });
    await productsCollection.createIndex({ 'subCategories.pricingTypeDesc': 1 });
    await productsCollection.createIndex({ 'subCategories.pricingTypeUnit': 1 });
    await productsCollection.createIndex({ 'subCategories.prices.size': 1 });
    await productsCollection.createIndex({ 'subCategories.prices.price': 1 });
    await productsCollection.createIndex({ 'subCategories.prices.visibleToGuest': 1 });

    await productsCollection.createIndex({ 'directPrices.price': 1 });
    await productsCollection.createIndex({ 'directPrices.priceType': 1 });
    await productsCollection.createIndex({ 'directPrices.pricePerUnit': 1 });
    await productsCollection.createIndex({ 'directPrices.visibleToGuest': 1 });

    console.log('Indexes for subCategories and directPrices created successfully');
  } catch (err) {
    console.error('Error creating indexes:', err);
  }

  // ------------------- Residential -------------------
  const residentialProduct = {
    name: '住宅代理',
    category: 'Residential',
    description: {
      short: '住宅代理',
      long: '高速、可靠的住宅代理',
      long2: '高效、实惠，旨在提供快速、安全的连接。',
      features: [
        '全球多个地点，保证高性能。',
        '灵活的计划，适合各种用例。'
      ]
    },
    subCategories: [
      {
        name: 'Bandwidth',
        pricingType: 'perGB',
        prices: [
          { size: 1, price: 4.5, visibleToGuest: true },
          { size: 5, price: 20, visibleToGuest: false },
          { size: 10, price: 35, visibleToGuest: false },
          { size: 25, price: 87.5, visibleToGuest: false },
          { size: 50, price: 162.5, visibleToGuest: false },
          { size: 100, price: 300, visibleToGuest: false },
          { size: 300, price: 720, visibleToGuest: false },
          { size: 500, price: 1000, visibleToGuest: false }
        ]
      },
      {
        name: 'Unlimited',
        pricingType: 'throughput',
        prices: [
          { size: 200, price: 2250, plan: 'Month', visibleToGuest: true },
          { size: 400, price: 3800, plan: 'Month', visibleToGuest: false },
          { size: 600, price: 4200, plan: 'Month', visibleToGuest: false },
          { size: 800, price: 4500, plan: 'Month', visibleToGuest: false },
          { size: 1000, price: 5000, plan: 'Month', visibleToGuest: false },
          { size: 200, price: 4000, plan: '2Month', visibleToGuest: false },
          { size: 400, price: 5500, plan: '2Month', visibleToGuest: false },
          { size: 600, price: 6600, plan: '2Month', visibleToGuest: false },
          { size: 800, price: 7400, plan: '2Month', visibleToGuest: false },
          { size: 1000, price: 8250, plan: '2Month', visibleToGuest: false }
        ]
      }
    ],
    directPrices: [],
    createdAt: new Date()
  };

  // ------------------- Mobile -------------------
  const mobileProduct = {
    name: '移动代理',
    category: 'Mobile',
    description: {
      short: '移动代理',
      long: '广泛的移动 IP 池，覆盖 50+ 国家。',
      long2: '适合高安全 Web 抓取、球鞋和社交媒体。',
      features: [
        '500k+ 实时移动节点',
        '支持 IP & User:Pass 验证',
        '国家 & ISP 定向',
        '轮换 & 粘性会话',
        '无限并发连接',
        '支持 HTTP/SOCKS5 协议',
        '条款与条件适用'
      ]
    },
    subCategories: [
      {
        name: 'Bandwidth',
        pricingType: 'perGB',
        prices: [
          { size: 1, price: 5.00, visibleToGuest: true },
          { size: 5, price: 22.50, visibleToGuest: false },
          { size: 10, price: 40.00, visibleToGuest: false },
          { size: 25, price: 100.00, visibleToGuest: false },
          { size: 50, price: 187.50, visibleToGuest: false },
          { size: 100, price: 350.00, visibleToGuest: false },
          { size: 300, price: 870.00, visibleToGuest: false },
          { size: 500, price: 1250.00, visibleToGuest: false },
          { size: 1000, price: 2000.00, visibleToGuest: false },
          { size: 2000, price: 3250.00, visibleToGuest: false },
          { size: 3000, price: 4350.00, visibleToGuest: false },
          { size: 5000, price: 6000.00, visibleToGuest: false }
        ]
      }
    ],
    directPrices: [],
    createdAt: new Date()
  };

  // ------------------- Datacenter -------------------
  const datacenterProduct = {
    name: '数据中心代理',
    category: 'Datacenter',
    description: {
      short: '数据中心代理',
      long: '强大且快速的 IPv4 轮换数据中心代理，最具性价比的选择。',
      long2: '适用于任何使用场景或目的。',
      features: [
        '20,000 IP 池',
        '支持 1 IP 验证',
        '国家定向',
        '反向连接端口',
        '无限流量',
        '支持 HTTP/SOCKS5 协议',
        '条款与条件适用'
      ]
    },
    subCategories: [
      {
        name: 'Duration',
        pricingType: 'time',
        prices: [
          { size: 1, price: 10.00, plan: 'Day', visibleToGuest: true },
          { size: 1, price: 50.00, plan: 'Week', visibleToGuest: false },
          { size: 1, price: 145.00, plan: 'Month', visibleToGuest: false }
        ]
      }
    ],
    directPrices: [],
    createdAt: new Date()
  };

  // ------------------- IPv6 -------------------
  const ipv6Product = {
    name: 'IPv6代理',
    category: 'IPv6',
    description: {
      short: 'IPv6代理',
      long: '提供数十亿个 IPv6 地址，让您的抓取更快更高效。',
      long2: '永不担心在支持 IPv6 的站点被封锁。',
      features: [
        '2x /29 网络 IP 池',
        '支持 IP & User:Pass 验证',
        '国家定向',
        '轮换 & 粘性会话',
        '支持 HTTP/SOCKS5 协议',
        '条款与条件适用'
      ]
    },
    subCategories: [
      {
        name: 'Bandwidth',
        pricingType: 'perGB',
        prices: [
          { size: 100, price: 20.00, visibleToGuest: true },
          { size: 250, price: 40.00, visibleToGuest: false },
          { size: 500, price: 70.00, visibleToGuest: false },
          { size: 1000, price: 110.00, visibleToGuest: false },
          { size: 3000, price: 250.00, visibleToGuest: false },
          { size: 5000, price: 350.00, visibleToGuest: false },
          { size: 10000, price: 550.00, visibleToGuest: false }
        ]
      },
      {
        name: 'Throughput',
        pricingType: 'throughput',
        prices: [
          { size: 30, price: 10.00, plan: '1Day', visibleToGuest: true },
          { size: 30, price: 45.00, plan: '7Day', visibleToGuest: false },
          { size: 30, price: 110.00, plan: '30Day', visibleToGuest: false },
          { size: 60, price: 15.00, plan: '1Day', visibleToGuest: false },
          { size: 60, price: 60.00, plan: '7Day', visibleToGuest: false },
          { size: 60, price: 160.00, plan: '30Day', visibleToGuest: false },
          { size: 120, price: 20.00, plan: '1Day', visibleToGuest: false },
          { size: 120, price: 90.00, plan: '7Day', visibleToGuest: false },
          { size: 120, price: 250.00, plan: '30Day', visibleToGuest: false },
          { size: 200, price: 25.00, plan: '1Day', visibleToGuest: false },
          { size: 200, price: 120.00, plan: '7Day', visibleToGuest: false },
          { size: 200, price: 350.00, plan: '30Day', visibleToGuest: false }
        ]
      }
    ],
    directPrices: [],
    createdAt: new Date()
  };

  const products = [residentialProduct, mobileProduct, datacenterProduct, ipv6Product];
  for (const product of products) {
    const exists = await productsCollection.findOne({ name: product.name });
    if (!exists) {
      await productsCollection.insertOne(product);
      console.log(`Product "${product.name}" created`);
    } else {
      console.log(`Product "${product.name}" already exists`);
    }
  }
}

module.exports = { run, name: '20251001-create-products-collection' };