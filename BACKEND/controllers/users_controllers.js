const jwt = require('jsonwebtoken');
const User = require('../models/user');

// POST /api/users - Registrar usuario
exports.registerUser = async (req, res) => {
  try {
    const { nombre, correo, pass, confirmPass } = req.body;

    if (!User.validatePassword(pass, confirmPass)) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    const correoExiste = await User.emailExists(correo);
    if (correoExiste) {
      return res.status(400).json({ error: 'El correo ya está en uso' });
    }

    const newUser = new User({ nombre, correo, pass });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/login - Login con JWT
exports.login = async (req, res) => {
  const { correo, pass } = req.body;

  try {
    const user = await User.findOne({ correo, pass });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Crear token JWT
    const token = jwt.sign(
      { id: user._id, correo: user.correo },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id - Obtener perfil
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-pass');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/:id - Actualizar perfil
exports.updateUser = async (req, res) => {
  const { nombre, correo, pass } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (nombre) user.nombre = nombre;
    if (correo) user.correo = correo;
    if (pass) user.pass = pass;

    const updated = await user.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/users/:id - Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Usuario eliminado exitosamente', user: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/:id/colaboradores
exports.agregarColaborador = async (req, res) => {
  const { id } = req.params;
  const { correoColaborador } = req.body;

  try {
    const colaborador = await User.findOne({ correo: correoColaborador });
    if (!colaborador) return res.status(404).json({ error: "Colaborador no encontrado." });

    const usuarioPrincipal = await User.findById(id);
    if (!usuarioPrincipal) return res.status(404).json({ error: "Usuario principal no encontrado." });

    if (usuarioPrincipal.colaboradores.includes(colaborador._id)) {
      return res.status(400).json({ error: "Colaborador ya añadido." });
    }

    usuarioPrincipal.colaboradores.push(colaborador._id);
    await usuarioPrincipal.save();

    res.status(200).json({ message: "Colaborador añadido correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id/colaboradores - Obtener los colaboradores de un usuario
exports.getColaboradores = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('colaboradores', 'nombre correo');
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(user.colaboradores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

