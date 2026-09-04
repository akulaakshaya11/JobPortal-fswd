const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Application model is defined in server.js and registered on mongoose.models
const Application = mongoose.models.Application;

// POST - submit application
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const { userId, jobId, name, email, phone, github, linkedin, coverLetter } = req.body;
    const resume = req.file ? req.file.filename : null;

    if (!userId || !jobId || !name || !email || !phone) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const exists = await Application.findOne({ jobId: parseInt(jobId), userId });
    if (exists) return res.status(400).json({ message: 'You have already applied for this job' });

    const created = await Application.create({
      jobId: parseInt(jobId),
      userId,
      name,
      email,
      phone,
      github: github || '',
      linkedin: linkedin || '',
      resume,
      coverLetter: coverLetter || '',
      status: 'Pending'
    });

    res.status(201).json({ message: 'Application submitted successfully', application: { ...created.toObject(), id: created._id.toString() } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET - fetch all applications
router.get('/', async (req, res) => {
  try {
    const docs = await Application.find().lean();
    res.json(docs.map(d => ({ ...d, id: d._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
