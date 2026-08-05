const express = require('express');

const Pedido = require('../models/Pedido');
const { verifyToken } = require('../middleware/auth');
const { enviarConfirmacionCliente, enviarNotificacionAdmin } = require('../utils/mailer');

const router = express.Router();

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

router.patch('/:id/estado', verifyToken, async (req, res) => {
  try {
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'confirmado', 'enviado', 'entregado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.estado = estado;
    await pedido.save();

    res.json(pedido);
  } catch (err) {
    console.error('Error al actualizar el pedido:', err);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

module.exports = router;
