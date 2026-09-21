const express = require('express');

const Producto = require('../models/Producto');
const { verifyToken } = require('../middleware/auth');
const { uploadProducto, cloudinary } = require('../utils/cloudinary');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filtro = { activo: true };

    if (req.query.categoria) {
      filtro.categoria = req.query.categoria;
    }

    if (req.query.destacado !== undefined) {
      filtro.destacado = req.query.destacado === 'true';
    }

    const productos = await Producto.find(filtro);
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

router.post(
  '/',
  verifyToken,
  uploadProducto.array('imagenes', 4),
  async (req, res) => {
    try {
      const datos = { ...req.body };

      if (req.body.tallas) {
        datos.tallas = Array.isArray(req.body.tallas)
          ? req.body.tallas
          : req.body.tallas.split(',').map((t) => t.trim());
      }

      if (req.body.colores) {
        datos.colores = Array.isArray(req.body.colores)
          ? req.body.colores
          : req.body.colores.split(',').map((c) => c.trim());
      }

      if (req.files && req.files.length > 0) {
        datos.imagenes = req.files.map((file) => file.path);
      }

      const producto = new Producto(datos);
      await producto.save();

      res.status(201).json(producto);
    } catch (err) {
      res.status(400).json({ error: 'Error al crear el producto' });
    }
  }
);

router.put(
  '/:id',
  verifyToken,
  uploadProducto.array('imagenes', 4),
  async (req, res) => {
    try {
      const producto = await Producto.findById(req.params.id);

      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const datos = { ...req.body };

      if (req.body.tallas) {
        datos.tallas = Array.isArray(req.body.tallas)
          ? req.body.tallas
          : req.body.tallas.split(',').map((t) => t.trim());
      }

      if (req.body.colores) {
        datos.colores = Array.isArray(req.body.colores)
          ? req.body.colores
          : req.body.colores.split(',').map((c) => c.trim());
      }

      if (req.files && req.files.length > 0) {
        datos.imagenes = req.files.map((file) => file.path);
      }

      Object.assign(producto, datos);
      await producto.save();

      res.json(producto);
    } catch (err) {
      res.status(400).json({ error: 'Error al actualizar el producto' });
    }
  }
);

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (producto.imagenes && producto.imagenes.length > 0) {
      await Promise.all(
        producto.imagenes.map((url) => {
          const match = url.match(/\/cost-store\/productos\/([^/.]+)/);
          if (!match) return Promise.resolve();
          const publicId = 'cost-store/productos/' + match[1];
          return cloudinary.uploader.destroy(publicId).catch(() => {});
        })
      );
    }

    await producto.deleteOne();

    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

router.patch('/:id/toggle', verifyToken, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    producto.activo = !producto.activo;
    await producto.save();

    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

module.exports = router;
