const mongoose = require('mongoose');

const productoPedidoSchema = new mongoose.Schema(
  {
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
    },
    nombre: {
      type: String,
      required: true,
    },
    precio: {
      type: Number,
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
    },
    talla: {
      type: String,
    },
    color: {
      type: String,
    },
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellido: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
  },
  direccion: {
    type: String,
    required: true,
  },
  ciudad: {
    type: String,
    required: true,
  },
  departamento: {
    type: String,
    required: true,
  },
  productos: {
    type: [productoPedidoSchema],
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  metodoPago: {
    type: String,
    enum: ['pse', 'tarjeta', 'contraentrega'],
    required: true,
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmado', 'enviado', 'entregado'],
    default: 'pendiente',
  },
  guiaEnvio: {
    type: String,
    default: '',
  },
  transportadora: {
    type: String,
    default: '',
  },
  imagenGuia: {
    type: String,
    default: '',
  },
  referencia: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pedido', pedidoSchema);
