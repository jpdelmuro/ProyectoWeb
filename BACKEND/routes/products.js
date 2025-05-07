const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const productController = require('../controllers/product_controllers');

// Rutas protegidas
router.get('/', auth, productController.getProductos);
router.post('/', auth, productController.addProducto);
router.delete('/:id', auth, productController.deleteProducto);

module.exports = router;
