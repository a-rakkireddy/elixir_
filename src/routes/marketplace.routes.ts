import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller';

const router = Router();
const marketplaceController = new MarketplaceController();

/**
 * @swagger
 * /api/v1/marketplace/products:
 *   get:
 *     summary: Get products from a specific vendor
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/vendorParam'
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Optional search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Optional category filter
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/products', (req, res, next) => {
  marketplaceController.getProducts(req, res, next);
});

/**
 * @swagger
 * /api/v1/marketplace/validate-inventory:
 *   post:
 *     summary: Validate inventory items
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vendor, items]
 *             properties:
 *               vendor:
 *                 type: string
 *                 enum: [ecom, voucher]
 *                 description: Vendor type
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/InventoryItem'
 *     responses:
 *       200:
 *         description: Inventory validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/InventoryValidationResult'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/validate-inventory', (req, res, next) => {
  marketplaceController.validateInventory(req, res, next);
});

/**
 * @swagger
 * /api/v1/marketplace/order:
 *   post:
 *     summary: Place an order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderData'
 *     responses:
 *       200:
 *         description: Order placement result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/OrderResult'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/order', (req, res, next) => {
  marketplaceController.placeOrder(req, res, next);
});

/**
 * @swagger
 * /api/v1/marketplace/order/{orderId}/track:
 *   get:
 *     summary: Track an order
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/orderIdParam'
 *       - $ref: '#/components/parameters/vendorParam'
 *     responses:
 *       200:
 *         description: Order tracking result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/TrackingResult'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/order/:orderId/track', (req, res, next) => {
  marketplaceController.trackOrder(req, res, next);
});

/**
 * @swagger
 * /api/v1/marketplace/order/{orderId}/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/orderIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vendor, reason]
 *             properties:
 *               vendor:
 *                 type: string
 *                 enum: [ecom, voucher]
 *                 description: Vendor type
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Order cancellation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CancellationResult'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/order/:orderId/cancel', (req, res, next) => {
  marketplaceController.cancelOrder(req, res, next);
});

export default router;
