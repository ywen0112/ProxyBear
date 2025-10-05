const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function run(client) {
  const db = client.db('ProxyBear');
  const collectionName = 'users';

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName);
    console.log(`Collection ${collectionName} created`);
  } else {
    console.log(`Collection ${collectionName} already exists`);
  }

  const usersCollection = db.collection(collectionName);

  await usersCollection.createIndex({ username: 1 });
  console.log('Created unique index on users.username');

  await usersCollection.createIndex({ email: 1 }, { unique: true });
  console.log('Created unique index on users.email');

  await usersCollection.createIndex({ role: 1 });
  console.log('Created index on users.role');

  await usersCollection.createIndex({ parent: 1 });
  console.log('Created index on users.parent');

  const adminExists = await usersCollection.findOne({ email: 'admin@gmail.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin', 12);
    await usersCollection.insertOne({
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      credit: 0,
      createdAt: new Date(),
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

module.exports = { run, name: '20251001-create-users-collection' };