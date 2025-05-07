const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['shoppingList', 'inventory'], required: true },
  owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Producto', ProductoSchema);
