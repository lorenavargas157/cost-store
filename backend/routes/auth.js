const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD || ''
    );

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;
