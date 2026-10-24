const express = require('express');
const router = express.Router();
const { createBloodRequest, getAllRequests } = require('../controllers/requestController');
const { protect, preventAdminAction } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getAllRequests)
  .post(protect, preventAdminAction, createBloodRequest);

module.exports = router;