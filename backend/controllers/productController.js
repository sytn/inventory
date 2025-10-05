const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

const productController = {
  // Create new product
  createProduct: asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  }),

  // Get all products
  getAllProducts: asyncHandler(async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
  }),

  // Get product by code
  getProductByCode: asyncHandler(async (req, res) => {
    const product = await Product.findByCode(req.params.code);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  }),

  // Update product
  updateProduct: asyncHandler(async (req, res) => {
    const product = await Product.update(req.params.code, req.body);
    res.json(product);
  }),

  // Delete product
  deleteProduct: asyncHandler(async (req, res) => {
    await Product.delete(req.params.code);
    res.json({ message: 'Product deleted successfully' });
  }),

  // Search products
  searchProducts: asyncHandler(async (req, res) => {
    const products = await Product.search(req.query);
    res.json(products);
  })
};

module.exports = productController;