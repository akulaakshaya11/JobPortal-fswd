const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Try several likely .env locations: backend/.env then project root .env
const candidates = [path.join(__dirname, '..', '.env'), path.join(__dirname, '..', '..', '.env')];
let loadedPath = null;
for (const p of candidates) {
  if (fs.existsSync(p)) {
    require('dotenv').config({ path: p });
    loadedPath = p;
    break;
  }
}
if (loadedPath) {
  console.log('[dotenv] loaded', loadedPath);
} else {
  // fallback to default behavior
  require('dotenv').config();
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
    console.log('MongoDB connected, readyState =', mongoose.connection.readyState);
    try {
      const admin = mongoose.connection.db.admin();
      const dbs = await admin.listDatabases();
      console.log('Databases:', dbs.databases.map(d => d.name));
    } catch (e) {
      console.log('Could not list databases:', e.message);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

run();
