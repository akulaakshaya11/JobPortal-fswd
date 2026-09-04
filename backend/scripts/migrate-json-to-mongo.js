const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

async function loadJson(fileName) {
  const p = path.join(__dirname, '..', 'data', fileName);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined, serverSelectionTimeoutMS: 10000 });

  // Ensure models exist in this process (define minimal schemas if not registered)
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ id: String, name: String, email: { type: String, unique: true }, password: String, role: String, createdAt: Date }));
  const Job = mongoose.models.Job || mongoose.model('Job', new mongoose.Schema({ id: Number, title: String, company: String, logo: String, location: String, salary: String, experience: String, skills: [String], description: String, requirements: String, postedBy: String, postedAt: Date }));
  const Application = mongoose.models.Application || mongoose.model('Application', new mongoose.Schema({ jobId: Number, userId: String, name: String, email: String, phone: String, github: String, linkedin: String, resume: String, coverLetter: String, status: String, appliedAt: Date }));
  const Alert = mongoose.models.Alert || mongoose.model('Alert', new mongoose.Schema({ userId: String, email: String, keywords: String, location: String, frequency: String, createdAt: Date, lastSent: Date }));
  const Review = mongoose.models.Review || mongoose.model('Review', new mongoose.Schema({ id: String, companyId: String, userId: String, rating: Number, title: String, content: String, pros: String, cons: String, createdAt: Date, isApproved: Boolean }));
  const SavedJob = mongoose.models.SavedJob || mongoose.model('SavedJob', new mongoose.Schema({ userId: String, jobId: Number, savedAt: Date, notes: String, priority: Number }));

  // USERS
  const users = await loadJson('users.json');
  if (users && users.length) {
    console.log('Importing users:', users.length);
    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      if (existing) continue;
  const hashed = u.password ? await bcrypt.hash(String(u.password), 10) : await bcrypt.hash('changeme', 10);
  const normalizedEmail = String(u.email || '').trim().toLowerCase();
  await User.create({ id: u.id || Date.now().toString(), name: u.name || u.fullname || 'User', email: normalizedEmail, password: hashed, role: u.role || 'job_seeker' });
    }
  }

  // JOBS
  const jobs = await loadJson('jobs.json') || await loadJson('../jobs.json');
  if (jobs && jobs.length) {
    console.log('Importing jobs:', jobs.length);
    for (const j of jobs) {
      const exists = await Job.findOne({ id: j.id });
      if (exists) continue;
      const doc = { id: j.id || Date.now(), title: j.title, company: j.company || j.employer || 'Unknown', location: j.location || '', salary: j.salary || '', experience: j.experience || '', skills: j.skills || [], description: j.description || j.summary || '', requirements: j.requirements || '', postedBy: j.postedBy || j.userId || 'system' };
      await Job.create(doc);
    }
  }

  // APPLICATIONS
  const apps = await loadJson('applications.json');
  if (apps && apps.length) {
    console.log('Importing applications:', apps.length);
    for (const a of apps) {
      const exists = await Application.findOne({ email: a.email, jobId: a.jobId });
      if (exists) continue;
      const doc = { jobId: a.jobId, userId: a.userId || a.id, name: a.name || '', email: a.email || '', phone: a.phone || '', github: a.github || '', linkedin: a.linkedin || '', resume: a.resume || '', coverLetter: a.coverLetter || '', status: a.status || 'Pending' };
      await Application.create(doc);
    }
  }

  // ALERTS
  const alerts = await loadJson('alerts.json');
  if (alerts && alerts.length) {
    console.log('Importing alerts:', alerts.length);
    for (const a of alerts) {
      const exists = await Alert.findOne({ userId: a.userId, keywords: a.keywords });
      if (exists) continue;
      await Alert.create({ userId: a.userId, email: a.email, keywords: a.keywords, location: a.location, frequency: a.frequency || 'daily' });
    }
  }

  // REVIEWS
  const reviews = await loadJson('reviews.json');
  if (reviews && reviews.length) {
    console.log('Importing reviews:', reviews.length);
    for (const r of reviews) {
      const exists = await Review.findOne({ id: r.id });
      if (exists) continue;
      await Review.create({ id: r.id || `r-${Date.now()}`, companyId: r.companyId || r.company || 'unknown', userId: r.userId || r.user || 'unknown', rating: r.rating || 0, title: r.title || '', content: r.content || '', pros: r.pros || '', cons: r.cons || '', isApproved: r.isApproved || false });
    }
  }

  // SAVED JOBS
  const saved = await loadJson('saved_jobs.json');
  if (saved && saved.length) {
    console.log('Importing saved jobs:', saved.length);
    for (const s of saved) {
      const exists = await SavedJob.findOne({ userId: s.userId, jobId: s.jobId });
      if (exists) continue;
      await SavedJob.create({ userId: s.userId, jobId: s.jobId, savedAt: s.savedAt ? new Date(s.savedAt) : new Date(), notes: s.notes || '', priority: s.priority || 0 });
    }
  }

  console.log('Migration complete');
  await mongoose.disconnect();
}

run().catch(err => { console.error('Migration error', err && err.message ? err.message : err); process.exit(1); });
