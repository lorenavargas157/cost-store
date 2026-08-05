const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
  },
  precio: {
    type: Number,
    required: true,
  },
  precioAnterior: {
    type: Number,
  },
  categoria: {
    type: String,
    enum: ['caballero', 'dama'],
    required: true,
  },
  tallas: {
    type: [String],
    default: [],
  },
  colores: {
    type: [String],
    default: [],
  },
  imagenes: {
    type: [String],
    default: [],
  },
  stock: {
    type: Number,
    default: 0,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  destacado: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Producto', productoSchema);
