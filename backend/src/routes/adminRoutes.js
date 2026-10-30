const express = require('express');
const { adminLogin, getDashboard, updateRecord, deleteRecord } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/auth/login', adminLogin);
router.use(protect, requireAdmin);
router.get('/dashboard', getDashboard);
router.patch('/records/:collection/:id', updateRecord);
router.delete('/records/:collection/:id', deleteRecord);

module.exports = router;
