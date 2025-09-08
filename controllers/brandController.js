const Brand = require('../models/Brand');

// Create Brand (Admin only)
exports.createBrand = async (req, res) => {
  try {
    const { brandName } = req.body;
    const brand = new Brand({ brandName });
    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error creating brand', error: error.message });
  }
};

// Get All Brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brands', error: error.message });
  }
};

// Get Single Brand
exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brand', error: error.message });
  }
};

// Update Brand
exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error updating brand', error: error.message });
  }
};

// Delete Brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting brand', error: error.message });
  }
};
