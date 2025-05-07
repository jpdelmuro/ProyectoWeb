const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config();

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, '../FRONTEND/views')));
app.use('/controllers', express.static(path.join(__dirname, '../FRONTEND/controllers')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/productos', productRoutes);


// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar MongoDB:', err));

// Start server
app.listen(port, () => {
  console.log(`Servidor backend corriendo en puerto ${port}`);
});
