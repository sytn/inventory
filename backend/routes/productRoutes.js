const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct, validateSearch, handleValidationErrors } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.post('/products', authMiddleware(['admin']), validateProduct, handleValidationErrors, productController.createProduct);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 */
router.get('/products', authMiddleware(), productController.getAllProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search and filter products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product_code
 *         schema:
 *           type: string
 *         description: Search by product code
 *       - in: query
 *         name: cloth_type
 *         schema:
 *           type: string
 *           enum: [DRESS, BLOUSE, SKIRT, TOP, PANTS]
 *         description: Filter by cloth type
 *       - in: query
 *         name: fabric_type
 *         schema:
 *           type: string
 *           enum: [COTTON, SILK, DENIM, LINEN, POLYESTER, WOOL]
 *         description: Filter by fabric type
 *       - in: query
 *         name: size_set
 *         schema:
 *           type: string
 *           enum: [STANDARD, PLUS]
 *         description: Filter by size set
 *     responses:
 *       200:
 *         description: Filtered products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 */
router.get('/products/search', authMiddleware(), validateSearch, handleValidationErrors, productController.searchProducts);

/**
 * @swagger
 * /api/products/{code}:
 *   get:
 *     summary: Get product by code
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Product code
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.get('/products/:code', authMiddleware(), productController.getProductByCode);

/**
 * @swagger
 * /api/products/{code}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Product code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.put('/products/:code', authMiddleware(['admin']), validateProduct, handleValidationErrors, productController.updateProduct);

/**
 * @swagger
 * /api/products/{code}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Product code
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.delete('/products/:code', authMiddleware(['admin']), productController.deleteProduct);

module.exports = router;