const Producto = require('../models/producto');
const User = require('../models/user'); // Importante: asegúrate de importar el modelo User arriba

exports.getProductos = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('colaboradores', '_id');
    const colaboradoresIds = user.colaboradores.map(c => c._id);
    const idsPermitidos = [req.user.id, ...colaboradoresIds];

    const productos = await Producto.find({ owners: { $in: idsPermitidos } });

    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};


exports.addProducto = async (req, res) => {
  console.log('Se recibió POST /api/productos');
  console.log('Body recibido:', req.body);

  try {
    const { name, quantity, category, type, price, barcode, origen } = req.body;

    // Obtener al usuario actual y sus colaboradores
    const user = await User.findById(req.user.id).populate('colaboradores', '_id');
    const colaboradoresIds = user.colaboradores.map(c => c._id);
    const owners = [req.user.id, ...colaboradoresIds];

    const nuevoProducto = new Producto({
      name,
      quantity,
      category,
      type,
      price,
      barcode,
      origen: origen || 'lista',
      owners // Todos los colaboradores verán este producto
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
    const producto = await Producto.findOne({ _id: req.params.id, owners: req.user.id });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado o no autorizado' });
    }

    const forzar = req.query.forzar === "true";
    if (producto.origen === 'lista' || forzar) {
      await producto.deleteOne();
      return res.json({ message: 'Producto eliminado permanentemente', producto });
    } else {
      producto.type = 'inventory';
      await producto.save();
      return res.json({ message: 'Producto regresado al inventario ideal', producto });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al manejar la eliminación del producto' });
  }
};


// Buscar producto por código de barras
exports.getByBarcode = async (req, res) => {
  try {
    const { codigo } = req.params;
    const producto = await Producto.findOne({ barcode: codigo });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado para este código de barras' });
    }

    res.json({
      name: producto.name,
      price: producto.price,
      category: producto.category
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar por código de barras' });
  }
};

// Actualizar producto
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const producto = await Producto.findOneAndUpdate(
      { _id: id, owners: req.user.id },
      updateData,
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado o no autorizado' });
    }

    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};
