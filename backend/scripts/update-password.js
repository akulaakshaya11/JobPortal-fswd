const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// load .env from backend or repo root
const candidates = [path.join(__dirname, '..', '.env'), path.join(__dirname, '..', '..', '.env')];
for (const p of candidates) if (fs.existsSync(p)) { dotenv.config({ path: p }); break; }

async function run() {
  const emailArg = process.argv[2];
  const newPassword = process.argv[3];
  if (!emailArg || !newPassword) {
    console.error('Usage: node update-password.js <email> <newPassword>');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined, serverSelectionTimeoutMS: 10000 });

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ id: String, name: String, email: String, password: String, role: String }));

  const normalizedEmail = String(emailArg).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    console.error('User not found:', normalizedEmail);
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();
  console.log('Password updated for', normalizedEmail);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err && err.message ? err.message : err); process.exit(1); });
