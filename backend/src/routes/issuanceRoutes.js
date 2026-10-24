const express = require('express');
const router = express.Router();
const { getIssuanceLogs, createIssuanceLog } = require('../controllers/issuanceController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getIssuanceLogs);
router.post('/', protect, createIssuanceLog);

module.exports = router;