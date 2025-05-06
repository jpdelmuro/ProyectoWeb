const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  pass: {
    type: String,
    required: true
  }
});

//validar si el correo ya existe en la base de datos
userSchema.statics.emailExists = async function (correo) {
  const user = await this.findOne({ correo });
  return !!user;
};

//validar que la contraseña y su confirmación coincidan
userSchema.statics.validatePassword = function (pass, confirmPass) {
  return pass === confirmPass;
};

module.exports = mongoose.model('User', userSchema);
