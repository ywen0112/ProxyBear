const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const migrations = [
  require('./20251001-create-products'),
  require('./20251001-create-user-billing-info-collection'),
  require('./20251001-create-users'),
];

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      await migration.run(client);
      console.log(`Completed migration: ${migration.name}`);
    }

    console.log('All migrations completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main();