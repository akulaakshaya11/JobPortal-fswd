const express = require('express');
const router = express.Router();

// Example companies & roles
const companies = [
  { name: "Google", roles: ["Frontend Developer", "Backend Developer", "UI/UX Designer"] },
  { name: "Amazon", roles: ["Backend Developer", "Cloud Engineer", "DevOps Engineer"] },
  { name: "Microsoft", roles: ["UI/UX Designer", "Project Manager", "Fullstack Developer"] }
];

// GET all companies
router.get('/', (req, res) => {
  res.json(companies);
});

module.exports = router;
