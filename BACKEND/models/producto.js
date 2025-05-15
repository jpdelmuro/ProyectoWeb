const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  category: { type: String },
  type: { type: String, enum: ['shoppingList', 'inventory'], required: true },
  price: { type: String },
  barcode: { type: String },
  origen: { type: String, enum: ['stock', 'lista'], required: true },
  owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Producto', productoSchema);
