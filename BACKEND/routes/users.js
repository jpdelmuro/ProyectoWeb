const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users_controllers');

// Registro y login
router.post('/', usersController.registerUser);
router.post('/login', usersController.login);

// Operaciones con ID
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
