export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { nombre, email, tel, msg } = req.body;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'ORMUZ Contacto <onboarding@resend.dev>',
        to: ['muibienadm@gmail.com'],
        subject: `📩 Mensaje directo ORMUZ — ${nombre}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f4f0;padding:40px 32px;border-radius:8px;">
            <div style="margin-bottom:28px;">
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:8px;">ORMUZ · MENSAJE DIRECTO</div>
              <div style="font-size:26px;font-weight:700;color:#0a0a0a;letter-spacing:-0.5px;">Nuevo mensaje del sitio</div>
            </div>
            <div style="background:#fff;border-radius:6px;padding:24px;margin-bottom:24px;border:1px solid #e8e8e4;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;width:100px;">Nombre</td><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;font-weight:600;color:#0a0a0a;">${nombre}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;">Correo</td><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;color:#0a0a0a;"><a href="mailto:${email}" style="color:#0a0a0a;">${email}</a></td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;">Teléfono</td><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;color:#0a0a0a;">${tel || 'No proporcionado'}</td></tr>
                <tr><td style="padding:10px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;vertical-align:top;">Mensaje</td><td style="padding:10px 0;color:#0a0a0a;line-height:1.6;">${msg}</td></tr>
              </table>
            </div>
            <div style="text-align:center;">
              <a href="mailto:${email}" style="display:inline-block;background:#0a0a0a;color:#fff;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;text-decoration:none;border-radius:2px;">Responder ahora</a>
            </div>
            <div style="margin-top:28px;font-size:10px;color:#bbb;text-align:center;letter-spacing:1px;">ORMUZ · CANCÚN, MÉXICO</div>
          </div>
        `
      })
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
