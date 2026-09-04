const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
// Load .env from backend folder or repo root so running server from backend picks it up
const dotenv = require('dotenv');
const envCandidates = [path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')];
let envLoaded = null;
for (const p of envCandidates) {
  if (fs.existsSync(p)) { dotenv.config({ path: p }); envLoaded = p; break; }
}
if (envLoaded) console.log('[dotenv] loaded', envLoaded);
else dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// reviews are stored in MongoDB via the Review model below

// ==================== MongoDB (Mongoose) Setup ====================
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jobportal";
const mongooseOptions = {
  dbName: process.env.MONGODB_DB || undefined,
  serverSelectionTimeoutMS: 10000,
};

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err && err.message ? err.message : err);
  });

const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["job_seeker", "employer"], required: true },
  createdAt: { type: Date, default: () => new Date() },
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const JobSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  logo: { type: String, default: "" },
  location: { type: String, required: true },
  salary: { type: String, default: "" },
  experience: { type: String, default: "" },
  skills: { type: [String], default: [] },
  description: { type: String, required: true },
  requirements: { type: String, default: "" },
  postedBy: { type: String, required: true },
  postedAt: { type: Date, default: () => new Date() },
});
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

const SavedJobSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  jobId: { type: Number, required: true },
  savedAt: { type: Date, default: () => new Date() },
  notes: { type: String, default: "" },
  priority: { type: Number, default: 0 },
});
const SavedJob = mongoose.models.SavedJob || mongoose.model("SavedJob", SavedJobSchema);

const AlertSchema = new mongoose.Schema({
  userId: { type: String },
  email: { type: String },
  keywords: { type: String },
  location: { type: String },
  frequency: { type: String, default: "daily" },
  createdAt: { type: Date, default: () => new Date() },
  lastSent: { type: Date, default: null },
});
const Alert = mongoose.models.Alert || mongoose.model("Alert", AlertSchema);

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: Number, required: true },
  userId: { type: String, required: true },
  name: String,
  email: String,
  phone: String,
  github: String,
  linkedin: String,
  resume: String,
  coverLetter: String,
  status: { type: String, default: "Pending" },
  appliedAt: { type: Date, default: () => new Date() },
});
const Application = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);

const ReviewSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  companyId: { type: String, required: true },
  userId: { type: String, required: true },
  rating: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  pros: { type: String, default: "" },
  cons: { type: String, default: "" },
  createdAt: { type: Date, default: () => new Date() },
  isApproved: { type: Boolean, default: false },
});
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

// No filesystem-backed review helpers — use the Review mongoose model instead

// Multer setup for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ==================== SAVED JOBS ENDPOINTS ====================

// Save a job
app.post("/api/jobs/:jobId/save", async (req, res) => {
  try {
    const { userId } = req.body;
    const { jobId } = req.params;
    const jobIdInt = parseInt(jobId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const existing = await SavedJob.findOne({ userId, jobId: jobIdInt });
    if (existing) {
      return res.status(400).json({ message: "Job already saved" });
    }
    await SavedJob.create({ userId, jobId: jobIdInt });
    res.status(201).json({ message: "Job saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving job", error: error.message });
  }
});

// Get user's saved jobs
app.get("/api/users/:userId/saved-jobs", async (req, res) => {
  try {
    const { userId } = req.params;
    const saved = await SavedJob.find({ userId }).lean();
    // fetch job details from Job collection
    const jobIds = saved.map(s => s.jobId);
    const jobs = await Job.find({ id: { $in: jobIds } }).lean();
    const result = saved.map((sj) => {
      const job = jobs.find((j) => j.id === sj.jobId);
      return job ? { ...sj, jobDetails: job } : null;
    }).filter(Boolean);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved jobs", error: error.message });
  }
});

// Remove saved job
app.delete("/api/jobs/:jobId/save", async (req, res) => {
  try {
    const { userId } = req.body;
    const { jobId } = req.params;
    const jobIdInt = parseInt(jobId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const del = await SavedJob.deleteOne({ userId, jobId: jobIdInt });
    if (del.deletedCount === 0) {
      return res.status(404).json({ message: "Saved job not found" });
    }
    res.json({ message: "Job removed from saved" });
  } catch (error) {
    res.status(500).json({ message: "Error removing saved job", error: error.message });
  }
});

// Update saved job metadata (notes, priority)
app.put("/api/users/:userId/saved-jobs/:jobId", async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    const jobIdInt = parseInt(jobId);
    const { notes, priority } = req.body;
    const update = {};
    if (typeof notes === "string") update.notes = notes;
    if (priority !== undefined) update.priority = Math.max(0, Math.min(5, parseInt(priority)) || 0);
    const savedJob = await SavedJob.findOneAndUpdate({ userId, jobId: jobIdInt }, update, { new: true });
    if (!savedJob) {
      return res.status(404).json({ message: "Saved job not found" });
    }
    res.json({ message: "Saved job updated", savedJob });
  } catch (error) {
    res.status(500).json({ message: "Error updating saved job", error: error.message });
  }
});

// ==================== JOB ALERTS ENDPOINTS ====================

// Create job alert
app.post("/api/alerts", async (req, res) => {
  try {
    const { userId, email, keywords, location, frequency = "daily" } = req.body;
    if ((!userId && !email) || (!keywords && !location)) {
      return res.status(400).json({ message: "Either userId or email, and at least one search criteria is required" });
    }
    const alert = await Alert.create({ userId, email, keywords, location, frequency });
    res.status(201).json({ message: "Job alert created", alertId: alert._id.toString() });
  } catch (error) {
    res.status(500).json({ message: "Error creating job alert", error: error.message });
  }
});

// Get user's alerts
app.get("/api/users/:userId/alerts", async (req, res) => {
  try {
    const { userId } = req.params;
    const alerts = await Alert.find({ userId }).lean();
    const normalized = alerts.map((a) => ({ ...a, id: a._id.toString() }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alerts", error: error.message });
  }
});

// Delete alert
app.delete("/api/alerts/:alertId", async (req, res) => {
  try {
    const { alertId } = req.params;
    const del = await Alert.deleteOne({ _id: alertId });
    if (del.deletedCount === 0) {
      return res.status(404).json({ message: "Alert not found" });
    }
    res.json({ message: "Alert deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting alert", error: error.message });
  }
});

// ==================== COMPANY REVIEWS ENDPOINTS ====================

// Add company review
app.post("/api/companies/:companyId/reviews", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { userId, rating, title, content, pros, cons } = req.body;
    
    if (!userId || !rating || !title || !content) {
      return res.status(400).json({ 
        message: "userId, rating, title, and content are required" 
      });
    }

    const review = await Review.create({
      id: `review-${Date.now()}`,
      companyId,
      userId,
      rating: parseInt(rating),
      title,
      content,
      pros: pros || "",
      cons: cons || "",
      isApproved: false,
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error submitting review", error: error.message });
  }
});

// Get company reviews
app.get("/api/companies/:companyId/reviews", async (req, res) => {
  try {
    const { companyId } = req.params;
    const reviews = await Review.find({ companyId, isApproved: true }).lean();
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    res.json({
      companyId,
      totalReviews: reviews.length,
      averageRating: avgRating.toFixed(1),
      reviews
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
});

// ==================== ROOT ENDPOINT ====================

// Mount modular routes
const applyRouter = require('./routes/apply');
app.use('/api/apply', applyRouter);

// GET / - Welcome message
app.get("/", (req, res) => {
  res.json({ message: "Job Portal Backend is running! Use /api/jobs to get all jobs." });
});

// GET /api - API info
app.get("/api", (req, res) => {
  res.json({
    message: "Job Portal API",
    endpoints: {
      auth: ["POST /api/register", "POST /api/login"],
      jobs: ["GET /api/jobs", "GET /api/jobs/:id", "POST /api/jobs", "PUT /api/jobs/:id", "DELETE /api/jobs/:id"],
      applications: ["POST /api/apply", "GET /api/applications/job/:jobId", "GET /api/applications/user/:userId", "PUT /api/applications/:id/status"],
      profile: ["GET /api/profile/:userId", "GET /api/employer/jobs/:userId"]
    }
  });
});

// ==================== AUTH ENDPOINTS ====================

// POST /api/register - Register a new user (Job Seeker or Employer)
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required (name, email, password, role)" });
    }

    if (!["job_seeker", "employer"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'job_seeker' or 'employer'" });
    }

  // normalize email for consistent storage and lookup
  const normalizedEmail = String(email).trim().toLowerCase();
  const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    const newUser = await User.create({
      id: userId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "Account created successfully",
      user: { id: newUser.id, name, email, role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/login - Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

  // normalize email before lookup
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== JOB ENDPOINTS ====================

// GET /api/jobs - Get all jobs with optional filters
app.get("/api/jobs", async (req, res) => {
  try {
    const { 
      search, 
      location, 
      minSalary, 
      maxSalary, 
      jobType, 
      experienceLevel,
      remote 
    } = req.query;
    
    let filter = {};

    if (search) {
      const searchLower = search.toLowerCase();
      filter.$or = [
        { title: { $regex: searchLower, $options: "i" } },
        { description: { $regex: searchLower, $options: "i" } },
        { company: { $regex: searchLower, $options: "i" } }
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
      filter.jobType = { $regex: jobType, $options: "i" };
    }

    if (experienceLevel) {
      filter.experienceLevel = { $regex: experienceLevel, $options: "i" };
    }

    const jobs = await Job.find(filter).lean();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
});

// GET /api/jobs/:id - Get single job by ID
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findOne({ id: parseInt(req.params.id) }).lean();

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/jobs - Create new job (Employer only)
app.post("/api/jobs", async (req, res) => {
  try {
    const { userId, title, company, location, salary, experience, skills, description, requirements } = req.body;

    if (!userId || !title || !company || !location || !salary || !description) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const user = await User.findOne({ id: userId });

    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    const lastJob = await Job.findOne().sort({ id: -1 }).lean();
    const newJobId = (lastJob?.id || 0) + 1;
    
    const newJob = await Job.create({
      id: newJobId,
      title,
      company,
      location,
      salary,
      experience: experience || "Not specified",
      skills: Array.isArray(skills) ? skills : [],
      description,
      requirements: requirements || "",
      postedBy: userId,
    });

    res.status(201).json({
      message: "Job posted successfully",
      job: newJob,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/jobs/:id - Update job (Employer only)
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const { userId, title, company, location, salary, experience, skills, description, requirements } = req.body;

    const user = await User.findOne({ id: userId });

    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can edit jobs" });
    }

    const job = await Job.findOne({ id: parseInt(req.params.id) });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy !== userId) {
      return res.status(403).json({ message: "You can only edit your own jobs" });
    }

    const updatedJob = await Job.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      {
        title: title || job.title,
        company: company || job.company,
        location: location || job.location,
        salary: salary || job.salary,
        experience: experience || job.experience,
        skills: skills || job.skills,
        description: description || job.description,
        requirements: requirements || job.requirements,
      },
      { new: true }
    );

    res.json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/jobs/:id - Delete job (Employer only)
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findOne({ id: userId });

    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can delete jobs" });
    }

    const job = await Job.findOne({ id: parseInt(req.params.id) });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy !== userId) {
      return res.status(403).json({ message: "You can only delete your own jobs" });
    }

    await Job.deleteOne({ id: parseInt(req.params.id) });
    await Application.deleteMany({ jobId: parseInt(req.params.id) });

    res.json({
      message: "Job deleted successfully",
      job: job,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== APPLICATION ENDPOINTS ====================

// POST /api/apply - Submit job application
app.post("/api/apply", upload.single("resume"), async (req, res) => {
  try {
    const { userId, jobId, name, email, phone, github, linkedin, coverLetter } = req.body;
    const resumePath = req.file ? req.file.filename : null;
    
    if (!userId || !jobId || !name || !email || !phone) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }
    
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const job = await Job.findOne({ id: parseInt(jobId) });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    const exists = await Application.findOne({ jobId: parseInt(jobId), userId });
    if (exists) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }
    
    const created = await Application.create({
      jobId: parseInt(jobId),
      userId,
      name,
      email,
      phone,
      github: github || "",
      linkedin: linkedin || "",
      resume: resumePath,
      coverLetter: coverLetter || "",
      status: "Pending",
    });
    
    const applicationOut = { ...created.toObject(), id: created._id.toString() };
    res.status(201).json({ message: "Application submitted successfully", application: applicationOut });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/applications/job/:jobId - Get applicants for a job (Employer only)
app.get("/api/applications/job/:jobId", async (req, res) => {
  try {
    const { userId } = req.query;
    
    const user = await User.findOne({ id: userId });
    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can view applicants" });
    }
    
    const job = await Job.findOne({ id: parseInt(req.params.jobId) });
    if (!job || job.postedBy !== userId) {
      return res.status(403).json({ message: "You can only view applicants for your jobs" });
    }
    
    const docs = await Application.find({ jobId: parseInt(req.params.jobId) }).lean();
    const out = docs.map((d) => ({ ...d, id: d._id.toString() }));
    res.json(out);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/applications/user/:userId - Get user's applications
app.get("/api/applications/user/:userId", async (req, res) => {
  try {
    const docs = await Application.find({ userId: req.params.userId }).lean();
    const out = docs.map((d) => ({ ...d, id: d._id.toString() }));
    res.json(out);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/applications/:id/status - Update application status (Employer only)
app.put("/api/applications/:id/status", async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    if (!["Pending", "Reviewed", "Selected", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const user = await User.findOne({ id: userId });
    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can update application status" });
    }
    
    const appDoc = await Application.findById(req.params.id);
    if (!appDoc) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    const job = await Job.findOne({ id: appDoc.jobId });
    if (!job || job.postedBy !== userId) {
      return res.status(403).json({ message: "You can only update applicants for your jobs" });
    }
    
    appDoc.status = status;
    await appDoc.save();
    const out = { ...appDoc.toObject(), id: appDoc._id.toString() };
    res.json({ message: "Application status updated", application: out });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== PROFILE ENDPOINTS ====================

// GET /api/profile/:userId - Get user profile
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.userId }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/employer/jobs/:userId - Get all jobs posted by employer
app.get("/api/employer/jobs/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.userId });

    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can access this endpoint" });
    }

    const employerJobs = await Job.find({ postedBy: req.params.userId }).lean();

    res.json(employerJobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Using MongoDB Atlas for data persistence`);
});
