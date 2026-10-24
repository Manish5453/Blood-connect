const express = require('express');
const router = express.Router();
const { getCamps, createCamp, deleteCamp } = require('../controllers/campController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getCamps);
router.post('/', protect, createCamp);
router.delete('/:id', protect, deleteCamp);

module.exports = router;