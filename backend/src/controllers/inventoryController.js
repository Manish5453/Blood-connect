const Inventory = require('../models/Inventory');

// Get all inventory
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({}).sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add inventory stock
const addInventoryStock = async (req, res) => {
  try {
    const { bloodGroup, units, hospitalName, city, contactPhone, batchNumber, expiryDate } = req.body;

    if (!bloodGroup || !units || !hospitalName || !city || !expiryDate) {
      return res.status(400).json({ message: 'Please fill all required fields including expiry date' });
    }

    const stock = await Inventory.create({
      hospital: req.user._id,
      hospitalName,
      bloodGroup,
      units,
      city,
      contactPhone,
      batchNumber: batchNumber || 'BATCH-' + Math.floor(Math.random() * 10000),
      expiryDate
    });

    res.status(201).json(stock);
  } catch (error) {
    console.error('INVENTORY ADD ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update inventory stock (Owner only)
const updateInventoryStock = async (req, res) => {
  try {
    const stock = await Inventory.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    // Check ownership
    if (stock.hospital.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this stock' });
    }

    const updatedStock = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete inventory stock (Owner only)
const deleteInventoryStock = async (req, res) => {
  try {
    const stock = await Inventory.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    // Check ownership
    if (stock.hospital.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this stock' });
    }

    await stock.deleteOne();
    res.json({ message: 'Stock removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventory,
  addInventoryStock,
  updateInventoryStock,
  deleteInventoryStock
};