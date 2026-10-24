const express = require('express');
const router = express.Router();
const { getSOSAlerts, createSOSAlert, resolveSOSAlert } = require('../controllers/sosController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getSOSAlerts);
router.post('/', protect, createSOSAlert);
router.put('/:id/resolve', protect, resolveSOSAlert);

module.exports = router;