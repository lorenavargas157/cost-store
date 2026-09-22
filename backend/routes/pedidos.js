const express = require('express');
const crypto = require('crypto');

const Pedido = require('../models/Pedido');
const { verifyToken } = require('../middleware/auth');
const { enviarConfirmacionCliente, enviarNotificacionAdmin, enviarActualizacionEstado } = require('../utils/mailer');
const { uploadGuia } = require('../utils/cloudinary');

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

router.patch('/:id/estado', verifyToken, uploadGuia.single('imagenGuia'), async (req, res) => {
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
    if (req.file) pedido.imagenGuia = req.file.path;
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

// Firma de integridad para abrir el widget de Wompi.
// Público (lo necesita el checkout anónimo), pero solo firma pedidos que ya
// existen en la base de datos: nunca acepta un monto/referencia arbitrarios
// del cliente, y el secreto de integridad nunca sale del backend.
router.get('/wompi/firma/:referencia', async (req, res) => {
  try {
    const pedido = await Pedido.findOne({ referencia: req.params.referencia });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const amountInCents = Math.round(pedido.total * 100);
    const cadena = pedido.referencia + amountInCents + 'COP' + process.env.WOMPI_INTEGRITY_SECRET;
    const signature = crypto.createHash('sha256').update(cadena).digest('hex');

    res.json({
      signature,
      amountInCents,
      currency: 'COP',
      reference: pedido.referencia,
    });
  } catch (err) {
    console.error('Error al generar firma de Wompi:', err);
    res.status(500).json({ error: 'Error al generar la firma' });
  }
});

router.post('/wompi/webhook', async (req, res) => {
  const { event, data, signature } = req.body;

  // Verificar firma
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  const checksum = signature?.checksum;
  const properties = signature?.properties || [];

  const concatenated = properties.map(p => {
    const parts = p.split('.');
    let val = data;
    for (const part of parts) val = val?.[part];
    return val;
  }).join('') + integritySecret;

  const hash = crypto.createHash('sha256').update(concatenated).digest('hex');

  if (hash !== checksum) {
    return res.status(401).json({ error: 'Firma inválida' });
  }

  if (event === 'transaction.updated') {
    const transaction = data.transaction;
    if (transaction.status === 'APPROVED') {
      const referencia = transaction.reference;
      const pedido = await Pedido.findOne({ referencia });
      if (pedido && pedido.estado === 'pendiente') {
        pedido.estado = 'confirmado';
        pedido.wompiTransactionId = transaction.id;
        await pedido.save();
        await enviarActualizacionEstado(pedido, 'pendiente');
      }
    }
  }

  res.json({ received: true });
});

module.exports = router;
