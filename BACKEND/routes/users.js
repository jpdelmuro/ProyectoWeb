const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users_controllers');

// Registro y login
router.post('/', usersController.registerUser);
router.post('/login', usersController.login);

// Colaboradores
router.post('/:id/colaboradores', usersController.agregarColaborador);
router.get('/:id/colaboradores', usersController.getColaboradores);
router.post('/:id/aceptar-colaborador', usersController.aceptarColaborador);

// CRUD con ID
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;