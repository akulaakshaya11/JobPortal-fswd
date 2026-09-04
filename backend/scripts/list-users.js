const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// load .env from backend or repo root
const candidates = [path.join(__dirname, '..', '.env'), path.join(__dirname, '..', '..', '.env')];
for (const p of candidates) if (fs.existsSync(p)) { dotenv.config({ path: p }); break; }

async function run() {
  if (!process.env.MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined, serverSelectionTimeoutMS: 10000 });
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ id: String, name: String, email: String, password: String, role: String }));
  const users = await User.find().lean();
  if (!users.length) console.log('No users found');
  users.forEach(u => console.log({ id: u.id, email: u.email, role: u.role, passwordHashLength: u.password ? u.password.length : 0 }));
  await mongoose.disconnect();
}

run().catch(err => { console.error(err.message || err); process.exit(1); });
