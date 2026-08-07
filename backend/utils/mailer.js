const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

async function enviarConfirmacionCliente(pedido) {
  const productosHtml = pedido.productos.map(p => `
    <tr>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0;
          font-family:Arial,sans-serif; font-size:14px;">${p.nombre}</td>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0;
          font-family:Arial,sans-serif; font-size:14px; text-align:center;">
          ${p.talla || '—'}</td>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0;
          font-family:Arial,sans-serif; font-size:14px; text-align:center;">
          ${p.cantidad}</td>
      <td style="padding:8px; border-bottom:1px solid #f0f0f0;
          font-family:Arial,sans-serif; font-size:14px; text-align:right;">
          $${p.precio.toLocaleString('es-CO')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;">

        <!-- HEADER -->
        <div style="background:#111111;padding:32px;text-align:center;">
          <h1 style="font-family:Georgia,serif;font-size:32px;
              letter-spacing:8px;color:#ffffff;margin:0;">COST</h1>
          <p style="font-family:Arial,sans-serif;font-size:11px;
              letter-spacing:3px;color:#b8963e;margin:8px 0 0;
              text-transform:uppercase;">Confirmación de Pedido</p>
        </div>

        <!-- BODY -->
        <div style="padding:40px 32px;">
          <p style="font-family:Arial,sans-serif;font-size:16px;
              color:#111111;margin:0 0 8px;">
              Hola, <strong>${pedido.nombre} ${pedido.apellido}</strong></p>
          <p style="font-family:Arial,sans-serif;font-size:14px;
              color:#555555;margin:0 0 24px;">
              ¡Gracias por tu compra! Hemos recibido tu pedido y
              lo estamos procesando.</p>

          <!-- REFERENCIA -->
          <div style="background:#f5f5f5;border-left:3px solid #b8963e;
              padding:16px 20px;margin-bottom:28px;">
            <p style="font-family:Arial,sans-serif;font-size:11px;
                letter-spacing:2px;color:#999999;
                text-transform:uppercase;margin:0 0 4px;">
                Número de pedido</p>
            <p style="font-family:Georgia,serif;font-size:20px;
                color:#111111;margin:0;font-weight:bold;">
                ${pedido.referencia}</p>
          </div>

          <!-- PRODUCTOS -->
          <p style="font-family:Arial,sans-serif;font-size:11px;
              letter-spacing:2px;color:#999999;
              text-transform:uppercase;margin:0 0 12px;">
              Resumen del pedido</p>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:10px 8px;font-family:Arial,sans-serif;
                    font-size:11px;letter-spacing:1px;color:#999999;
                    text-transform:uppercase;text-align:left;">Producto</th>
                <th style="padding:10px 8px;font-family:Arial,sans-serif;
                    font-size:11px;letter-spacing:1px;color:#999999;
                    text-transform:uppercase;text-align:center;">Talla</th>
                <th style="padding:10px 8px;font-family:Arial,sans-serif;
                    font-size:11px;letter-spacing:1px;color:#999999;
                    text-transform:uppercase;text-align:center;">Cant.</th>
                <th style="padding:10px 8px;font-family:Arial,sans-serif;
                    font-size:11px;letter-spacing:1px;color:#999999;
                    text-transform:uppercase;text-align:right;">Precio</th>
              </tr>
            </thead>
            <tbody>${productosHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding:12px 8px;
                    font-family:Arial,sans-serif;font-size:14px;
                    font-weight:bold;color:#111111;">Total</td>
                <td style="padding:12px 8px;font-family:Georgia,serif;
                    font-size:18px;color:#111111;font-weight:bold;
                    text-align:right;">
                    $${pedido.total.toLocaleString('es-CO')}</td>
              </tr>
            </tfoot>
          </table>

          <!-- DIRECCIÓN -->
          <div style="margin-top:28px;padding-top:24px;
              border-top:1px solid #f0f0f0;">
            <p style="font-family:Arial,sans-serif;font-size:11px;
                letter-spacing:2px;color:#999999;
                text-transform:uppercase;margin:0 0 8px;">
                Dirección de envío</p>
            <p style="font-family:Arial,sans-serif;font-size:14px;
                color:#555555;margin:0;line-height:1.6;">
                ${pedido.direccion}<br>
                ${pedido.ciudad}, ${pedido.departamento}
            </p>
          </div>

          <!-- MÉTODO DE PAGO -->
          <div style="margin-top:20px;">
            <p style="font-family:Arial,sans-serif;font-size:11px;
                letter-spacing:2px;color:#999999;
                text-transform:uppercase;margin:0 0 4px;">
                Método de pago</p>
            <p style="font-family:Arial,sans-serif;font-size:14px;
                color:#555555;margin:0;text-transform:capitalize;">
                ${pedido.metodoPago}</p>
          </div>

          <!-- MENSAJE FINAL -->
          <div style="margin-top:32px;padding:20px;
              background:#f5f5f5;text-align:center;">
            <p style="font-family:Arial,sans-serif;font-size:13px;
                color:#555555;margin:0 0 8px;">
                ¿Tienes alguna duda sobre tu pedido?</p>
            <a href="https://wa.me/573018787556"
               style="font-family:Arial,sans-serif;font-size:12px;
               color:#25D366;text-decoration:none;font-weight:bold;">
               Escríbenos por WhatsApp →</a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background:#111111;padding:24px;text-align:center;">
          <p style="font-family:Arial,sans-serif;font-size:11px;
              letter-spacing:2px;color:rgba(255,255,255,0.4);margin:0;">
              © 2026 COST · Todos los derechos reservados</p>
        </div>

      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: pedido.email,
    subject: `COST · Confirmación de pedido ${pedido.referencia}`,
    html
  });
}

async function enviarNotificacionAdmin(pedido) {
  const productosTexto = pedido.productos.map(p =>
    `• ${p.nombre} | Talla: ${p.talla || '—'} | Color: ${p.color || '—'} | Cant: ${p.cantidad} | $${p.precio.toLocaleString('es-CO')}`
  ).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#111111;padding:24px;text-align:center;">
          <h1 style="font-family:Georgia,serif;font-size:28px;
              letter-spacing:6px;color:#ffffff;margin:0;">COST</h1>
          <p style="font-family:Arial,sans-serif;font-size:11px;
              letter-spacing:3px;color:#b8963e;margin:6px 0 0;
              text-transform:uppercase;">Nuevo Pedido Recibido</p>
        </div>
        <div style="padding:32px;">
          <div style="background:#f5f5f5;border-left:3px solid #b8963e;
              padding:16px 20px;margin-bottom:24px;">
            <p style="font-family:Arial,sans-serif;font-size:11px;
                letter-spacing:2px;color:#999;
                text-transform:uppercase;margin:0 0 4px;">Referencia</p>
            <p style="font-family:Georgia,serif;font-size:22px;
                color:#111;margin:0;font-weight:bold;">
                ${pedido.referencia}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;
              margin-bottom:24px;">
            <tr>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;">
                  <strong>Cliente</strong></td>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#111;border-bottom:1px solid #f0f0f0;">
                  ${pedido.nombre} ${pedido.apellido}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;">
                  <strong>Email</strong></td>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#111;border-bottom:1px solid #f0f0f0;">
                  ${pedido.email}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;">
                  <strong>Teléfono</strong></td>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#111;border-bottom:1px solid #f0f0f0;">
                  ${pedido.telefono}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;">
                  <strong>Dirección</strong></td>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#111;border-bottom:1px solid #f0f0f0;">
                  ${pedido.direccion}, ${pedido.ciudad},
                  ${pedido.departamento}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;">
                  <strong>Pago</strong></td>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#111;border-bottom:1px solid #f0f0f0;
                  text-transform:capitalize;">
                  ${pedido.metodoPago}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-family:Arial,sans-serif;
                  font-size:13px;color:#555;">
                  <strong>Total</strong></td>
              <td style="padding:8px;font-family:Georgia,serif;
                  font-size:18px;color:#111;font-weight:bold;">
                  $${pedido.total.toLocaleString('es-CO')}</td>
            </tr>
          </table>

          <p style="font-family:Arial,sans-serif;font-size:11px;
              letter-spacing:2px;color:#999;
              text-transform:uppercase;margin:0 0 12px;">Productos</p>
          <pre style="font-family:Arial,sans-serif;font-size:13px;
              color:#555;background:#f5f5f5;padding:16px;
              white-space:pre-wrap;margin:0;">
${productosTexto}
          </pre>
        </div>
        <div style="background:#111;padding:20px;text-align:center;">
          <p style="font-family:Arial,sans-serif;font-size:11px;
              letter-spacing:2px;color:rgba(255,255,255,0.4);margin:0;">
              © 2026 COST · Panel de administración</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: 'storecosto@gmail.com',
    subject: `🛍️ Nuevo pedido COST · ${pedido.referencia} · $${pedido.total.toLocaleString('es-CO')}`,
    html
  });
}

async function enviarActualizacionEstado(pedido, estadoAnterior) {
  const mensajes = {
    confirmado: {
      titulo: '¡Tu pedido fue confirmado!',
      descripcion: 'Estamos preparando tu pedido con mucho cuidado.',
      icono: '✓',
      color: '#2d7a2d'
    },
    enviado: {
      titulo: '¡Tu pedido está en camino!',
      descripcion: 'Tu pedido ha sido despachado y está en camino a tu dirección.',
      icono: '🚚',
      color: '#b8963e'
    },
    entregado: {
      titulo: '¡Tu pedido fue entregado!',
      descripcion: 'Esperamos que disfrutes tu compra. ¡Gracias por confiar en COST!',
      icono: '✦',
      color: '#111111'
    },
    pendiente: {
      titulo: 'Tu pedido está pendiente',
      descripcion: 'Tu pedido está en espera de confirmación.',
      icono: '◷',
      color: '#999999'
    }
  };

  const info = mensajes[pedido.estado] || {
    titulo: `Estado actualizado: ${pedido.estado}`,
    descripcion: '',
    icono: '·',
    color: '#111111'
  };

  const productosHtml = pedido.productos.map(p => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;
          font-family:Arial,sans-serif;font-size:14px;color:#111111;">
          ${p.nombre}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;
          font-family:Arial,sans-serif;font-size:14px;
          color:#555555;text-align:center;">
          ${p.talla || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;
          font-family:Arial,sans-serif;font-size:14px;
          color:#111111;text-align:right;">
          $${p.precio.toLocaleString('es-CO')}</td>
    </tr>
  `).join('');

  let imagenGuiaHtml = '';
  if (pedido.imagenGuia && pedido.estado === 'enviado') {
    try {
      const imgPath = path.join(__dirname, '../uploads/', pedido.imagenGuia);
      if (fs.existsSync(imgPath)) {
        const imgBuffer = fs.readFileSync(imgPath);
        const imgBase64 = imgBuffer.toString('base64');
        const ext = path.extname(pedido.imagenGuia).toLowerCase().replace('.', '');
        const mimeType = ext === 'jpg' ? 'jpeg' : ext;
        imagenGuiaHtml = `
          <img src="data:image/${mimeType};base64,${imgBase64}"
               style="max-width:100%;margin-top:12px;
               border:1px solid #e8e8e8;display:block;"
               alt="Guía de envío" />
        `;
      }
    } catch(e) {
      console.error('Error leyendo imagen guía:', e);
    }
  }

  const guiaHtml = (pedido.estado === 'enviado' && pedido.guiaEnvio)
    ? `
      <div style="margin-top:20px;padding:16px 20px;
          background:#f5f5f5;border-left:3px solid #b8963e;">
        <p style="font-family:Arial,sans-serif;font-size:11px;
            letter-spacing:2px;color:#999999;
            text-transform:uppercase;margin:0 0 4px;">
            Información de envío</p>
        ${pedido.transportadora ? `
        <p style="font-family:Arial,sans-serif;font-size:13px;
            color:#555555;margin:0 0 4px;">
            Transportadora: <strong>${pedido.transportadora}</strong></p>
        ` : ''}
        <p style="font-family:Arial,sans-serif;font-size:13px;
            color:#555555;margin:0 0 8px;">
            Número de guía:
            <strong style="font-size:16px;color:#111111;">
            ${pedido.guiaEnvio}</strong></p>
        ${imagenGuiaHtml}
      </div>
    `
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;">

        <!-- HEADER -->
        <div style="background:#111111;padding:32px;text-align:center;">
          <h1 style="font-family:Georgia,serif;font-size:32px;
              letter-spacing:8px;color:#ffffff;margin:0;">COST</h1>
        </div>

        <!-- ESTADO BADGE -->
        <div style="background:${info.color};padding:24px;text-align:center;">
          <p style="font-family:Georgia,serif;font-size:28px;
              color:#ffffff;margin:0;">${info.icono}</p>
          <h2 style="font-family:Georgia,serif;font-size:20px;
              letter-spacing:3px;color:#ffffff;margin:8px 0 0;">
              ${info.titulo}</h2>
        </div>

        <!-- BODY -->
        <div style="padding:40px 32px;">
          <p style="font-family:Arial,sans-serif;font-size:16px;
              color:#111111;margin:0 0 8px;">
              Hola, <strong>${pedido.nombre} ${pedido.apellido}</strong></p>
          <p style="font-family:Arial,sans-serif;font-size:14px;
              color:#555555;margin:0 0 28px;">
              ${info.descripcion}</p>

          <!-- REFERENCIA -->
          <div style="background:#f5f5f5;border-left:3px solid #b8963e;
              padding:16px 20px;margin-bottom:28px;">
            <p style="font-family:Arial,sans-serif;font-size:11px;
                letter-spacing:2px;color:#999999;
                text-transform:uppercase;margin:0 0 4px;">
                Número de pedido</p>
            <p style="font-family:Georgia,serif;font-size:20px;
                color:#111111;margin:0;font-weight:bold;">
                ${pedido.referencia}</p>
          </div>

          <!-- PRODUCTOS -->
          <table style="width:100%;border-collapse:collapse;
              margin-bottom:24px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:10px 8px;font-family:Arial,sans-serif;
                    font-size:11px;letter-spacing:1px;color:#999999;
                    text-transform:uppercase;text-align:left;">
                    Producto</th>
                <th style="padding:10px 8px;font-family:Arial,sans-serif;
                    font-size:11px;letter-spacing:1px;color:#999999;
                    text-transform:uppercase;text-align:center;">
                    Talla</th>
                <th style="padding:10px 8px;font-family:Arial,sans-serif;
                    font-size:11px;letter-spacing:1px;color:#999999;
                    text-transform:uppercase;text-align:right;">
                    Precio</th>
              </tr>
            </thead>
            <tbody>${productosHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 8px;
                    font-family:Arial,sans-serif;font-size:14px;
                    font-weight:bold;color:#111111;">Total</td>
                <td style="padding:12px 8px;font-family:Georgia,serif;
                    font-size:18px;color:#111111;font-weight:bold;
                    text-align:right;">
                    $${pedido.total.toLocaleString('es-CO')}</td>
              </tr>
            </tfoot>
          </table>

          <!-- DIRECCIÓN -->
          <div style="padding-top:20px;border-top:1px solid #f0f0f0;">
            <p style="font-family:Arial,sans-serif;font-size:11px;
                letter-spacing:2px;color:#999999;
                text-transform:uppercase;margin:0 0 8px;">
                Dirección de entrega</p>
            <p style="font-family:Arial,sans-serif;font-size:14px;
                color:#555555;margin:0;line-height:1.6;">
                ${pedido.direccion}<br>
                ${pedido.ciudad}, ${pedido.departamento}
            </p>
          </div>
          ${guiaHtml}

          <!-- CTA WHATSAPP -->
          <div style="margin-top:32px;padding:20px;
              background:#f5f5f5;text-align:center;">
            <p style="font-family:Arial,sans-serif;font-size:13px;
                color:#555555;margin:0 0 8px;">
                ¿Tienes alguna duda?</p>
            <a href="https://wa.me/573018787556"
               style="font-family:Arial,sans-serif;font-size:12px;
               color:#25D366;text-decoration:none;font-weight:bold;">
               Escríbenos por WhatsApp →</a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background:#111111;padding:24px;text-align:center;">
          <p style="font-family:Arial,sans-serif;font-size:11px;
              letter-spacing:2px;color:rgba(255,255,255,0.4);margin:0;">
              © 2026 COST · Todos los derechos reservados</p>
        </div>

      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: pedido.email,
    subject: `COST · ${info.titulo} · ${pedido.referencia}`,
    html
  });
}

module.exports = {
  enviarConfirmacionCliente,
  enviarNotificacionAdmin,
  enviarActualizacionEstado
};
