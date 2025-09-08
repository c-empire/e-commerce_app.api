import Product from '../models/Product';
import mongoose from 'mongoose';

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('ownerId', 'fullName email')
      .populate('brand', 'brandName');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

exports.getProductsByBrandPaginated = async (req, res) => {
  const { brand, page, limit } = req.params;
  try {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: ['brand', 'ownerId']
    };
    const result = await Product.paginate({ brand }, options);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { productName, cost, productImages, description, stockStatus, brand } = req.body;

    const product = new Product({
      productName,
      ownerId: req.user.userId,
      brand,
      cost,
      productImages,
      description,
      stockStatus
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

