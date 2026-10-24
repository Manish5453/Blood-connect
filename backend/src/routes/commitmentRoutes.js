const express = require('express');
const router = express.Router();
const { getCommitments, createCommitment, updateCommitmentStatus } = require('../controllers/commitmentController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getCommitments);
router.post('/', protect, createCommitment);
router.put('/:id/status', protect, updateCommitmentStatus);

module.exports = router;