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

    // Verifica que la solicitud no haya sido enviada antes
    if (colaborador.solicitudesPendientes.includes(usuarioPrincipal._id)) {
      return res.status(400).json({ error: "Ya enviaste una solicitud a este usuario." });
    }

    // Agrega solicitud pendiente al colaborador
    colaborador.solicitudesPendientes.push(usuarioPrincipal._id);
    await colaborador.save();

    res.status(200).json({ message: "Solicitud enviada. Esperando confirmación." });

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


// POST /api/users/:id/aceptar-colaborador
exports.aceptarColaborador = async (req, res) => {
  const { id } = req.params; // usuario que acepta la solicitud
  const { solicitanteId } = req.body; // quien envió la solicitud

  try {
    const usuario = await User.findById(id); // el que acepta
    const solicitante = await User.findById(solicitanteId); // el que envió

    if (!usuario || !solicitante) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validar que la solicitud sí existe
    if (!usuario.solicitudesPendientes.includes(solicitanteId)) {
      return res.status(400).json({ error: "No hay solicitud pendiente de este usuario" });
    }

    // Agregarse mutuamente como colaboradores
    if (!usuario.colaboradores.includes(solicitanteId)) {
      usuario.colaboradores.push(solicitanteId);
    }

    if (!solicitante.colaboradores.includes(id)) {
      solicitante.colaboradores.push(id);
    }

    // Quitar solicitud pendiente
    usuario.solicitudesPendientes = usuario.solicitudesPendientes.filter(
      uid => uid.toString() !== solicitanteId
    );

    await usuario.save();
    await solicitante.save();

    res.status(200).json({ message: "Solicitud aceptada. Ahora son colaboradores." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

