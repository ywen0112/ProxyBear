const { MongoClient } = require('mongodb');

async function run(client) {
  const db = client.db('ProxyBear');
  const collectionName = 'userbillinginfos';

  // Check if collection exists
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName);
    console.log(`Collection ${collectionName} created`);
  } else {
    console.log(`Collection ${collectionName} already exists`);
  }

  const billingCollection = db.collection(collectionName);

  // Indexes
  await billingCollection.createIndex({ user: 1 }, { unique: true });
  console.log('Created unique index on userbillinginfos.user');

  await billingCollection.createIndex({ legalName: 1 });
  console.log('Created index on userbillinginfos.legalName');

  await billingCollection.createIndex({ legalSurname: 1 });
  console.log('Created index on userbillinginfos.legalSurname');

  await billingCollection.createIndex({ billingEmail: 1 });
  console.log('Created index on userbillinginfos.billingEmail');

  await billingCollection.createIndex({ phone: 1 });
  console.log('Created index on userbillinginfos.phone');

  await billingCollection.createIndex({ address: 1 });
  console.log('Created index on userbillinginfos.address');

  await billingCollection.createIndex({ zip: 1 });
  console.log('Created index on userbillinginfos.zip');

  await billingCollection.createIndex({ companyMode: 1 });
  console.log('Created index on userbillinginfos.companyMode');

  await billingCollection.createIndex({ companyName: 1 });
  console.log('Created index on userbillinginfos.companyName');

  await billingCollection.createIndex({ vatNumber: 1 });
  console.log('Created index on userbillinginfos.vatNumber');
}

module.exports = { run, name: '20251001-create-user-billing-info-collection' };
