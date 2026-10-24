const express = require('express');
const router = express.Router();
const { getDonors } = require('../controllers/donorController'); // ya userController

// Route for fetching donors
router.get('/', getDonors);

module.exports = router;