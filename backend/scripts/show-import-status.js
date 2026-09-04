const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined, serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;

  const collections = ['users','jobs','applications','alerts','reviews','savedjobs','saved_jobs'];
  console.log('Database:', process.env.MONGODB_DB || '(from URI)');
  for (const name of collections) {
    try {
      const col = db.collection(name);
      const count = await col.countDocuments();
      console.log(`${name}: ${count}`);
    } catch (e) {
      // collection may not exist
      console.log(`${name}: (not found)`);
    }
  }

  // also list all collections
  const all = await db.listCollections().toArray();
  console.log('\nAll collections:', all.map(c => c.name).join(', '));

  await mongoose.disconnect();
}

run().catch(err => { console.error('Error', err && err.message ? err.message : err); process.exit(1); });
