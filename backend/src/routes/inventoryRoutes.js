const express = require('express');
const router = express.Router();
const { getInventory, addInventoryStock } = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getInventory);
router.post('/', protect, addInventoryStock);

module.exports = router;