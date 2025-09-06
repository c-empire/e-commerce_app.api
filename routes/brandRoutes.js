const express = require('express');
const Brand = require('../models/Brand');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Create brand
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { brandName } = req.body;
    const brand = new Brand({ brandName });
    await brand.save();
    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update brand
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { brandName: req.body.brandName },
      { new: true }
    );
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete brand
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
