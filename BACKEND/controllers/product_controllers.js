const Producto = require('../models/producto');

// Obtener productos del usuario actual
exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ owners: req.user.id });
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// Crear nuevo producto
exports.addProducto = async (req, res) => {
    console.log('🔔 Se recibió POST /api/productos');
    console.log('🧾 Body recibido:', req.body);
  
    try {
      const { name, quantity, category, type } = req.body;
      const nuevoProducto = new Producto({
        name,
        quantity,
        category,
        type,
        owners: [req.user.id]
      });
  
      await nuevoProducto.save();
      res.status(201).json(nuevoProducto);
    } catch (error) {
      res.status(500).json({ error: 'Error al guardar el producto' });
    }
};
  

// Eliminar producto del usuario actual
exports.deleteProducto = async (req, res) => {
  try {
    const producto = await Producto.findOneAndDelete({
      _id: req.params.id,
      owners: req.user.id
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado o no autorizado' });
    }

    res.json({ message: 'Producto eliminado', producto });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};
