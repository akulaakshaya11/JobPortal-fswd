const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// load .env
const candidates = [path.join(__dirname, '..', '.env'), path.join(__dirname, '..', '..', '.env')];
for (const p of candidates) if (fs.existsSync(p)) { dotenv.config({ path: p }); break; }

async function run() {
  if (!process.env.MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined, serverSelectionTimeoutMS: 10000 });
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ id: String, name: String, email: String, password: String, role: String }));

  const email = process.argv[2] || 'test@example.com';
  const rawPassword = process.argv[3] || 'password123';
  const role = process.argv[4] || 'job_seeker';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log('User already exists:', email);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(rawPassword, 10);
  const newUser = await User.create({ id: Date.now().toString(), name: 'Test User', email, password: hashed, role });
  console.log('Created user', { id: newUser.id, email: newUser.email });
  await mongoose.disconnect();
}

run().catch(err => { console.error(err.message || err); process.exit(1); });
