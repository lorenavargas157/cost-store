const express = require('express');
const multer = require('multer');
const path = require('path');

const Pedido = require('../models/Pedido');
const { verifyToken } = require('../middleware/auth');
const { enviarConfirmacionCliente, enviarNotificacionAdmin, enviarActualizacionEstado } = require('../utils/mailer');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, suffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

function generarReferencia() {
  const anio = new Date().getFullYear();
  const numeros = Math.floor(10000 + Math.random() * 90000);
  return `CST-${anio}-${numeros}`;
}

router.post('/', async (req, res) => {
  try {
    let referencia = generarReferencia();

    let existente = await Pedido.findOne({ referencia });
    while (existente) {
      referencia = generarReferencia();
      existente = await Pedido.findOne({ referencia });
    }

    const pedido = new Pedido({ ...req.body, referencia });
    await pedido.save();

    console.log('Pedido creado:', pedido.referencia);

    // Enviar correos (sin bloquear la respuesta)
    Promise.all([
      enviarConfirmacionCliente(pedido),
      enviarNotificacionAdmin(pedido)
    ]).catch(err => console.error('Error enviando correos:', err));

    // Responder inmediatamente sin esperar los correos
    res.status(201).json({ ok: true, pedido });
  } catch (err) {
    console.error('Error al crear el pedido:', err);
    res.status(400).json({ error: 'Error al crear el pedido' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  console.log('GET /api/pedidos llamado');
  try {
    const filtro = {};

    if (req.query.estado) {
      filtro.estado = req.query.estado;
    }

    const pedidos = await Pedido.find(filtro).sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    console.error('Error al obtener los pedidos:', err);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
});

router.patch('/:id/estado', verifyToken, upload.single('imagenGuia'), async (req, res) => {
  try {
    const { estado, guiaEnvio, transportadora } = req.body;

    const estadosValidos = ['pendiente', 'confirmado', 'enviado', 'entregado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Guardar estado anterior
    const estadoAnterior = pedido.estado;

    // Actualizar
    pedido.estado = estado;
    if (guiaEnvio !== undefined) pedido.guiaEnvio = guiaEnvio;
    if (transportadora !== undefined) pedido.transportadora = transportadora;
    if (req.file) pedido.imagenGuia = req.file.filename;
    await pedido.save();

    // Enviar correo sin bloquear
    enviarActualizacionEstado(pedido, estadoAnterior)
      .catch(err => console.error('Error enviando correo de estado:', err));

    res.json({ ok: true, pedido });
  } catch (err) {
    console.error('Error al actualizar el pedido:', err);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

module.exports = router;
