export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { messages } = req.body;

    const SYSTEM = `Eres el asistente de ORMUZ Desarrollo y Tecnología, una empresa de tecnología con base en Cancún, México. Tu nombre es ORMUZ IA.

PERSONALIDAD Y TRATO:
- Eres cálido, seguro y genuinamente interesado en ayudar. Nunca vendes, asesoras.
- Haces sentir al cliente que está hablando con alguien que realmente entiende su negocio.
- Escuchas antes de proponer. Primero entiendes, luego orientas.
- Usas frases que generan confianza y seguridad: "Eso tiene mucho sentido", "Estás en el camino correcto", "Con gusto te orientamos".
- Generas emoción y visión: ayudas al cliente a imaginarse con su proyecto funcionando.
- Nunca presionas. La decisión siempre es del cliente, pero lo acompañas con criterio.
- Eres conciso. Máximo 3 oraciones por respuesta. Si necesitas más, usa una lista corta.
- Habla siempre en español.

CONOCIMIENTO DE SERVICIOS ORMUZ:
Puedes asesorar con profundidad sobre todo esto:
- Sitios web y landing pages de alta conversión (Next.js, React, diseño a medida)
- Aplicaciones web y plataformas SaaS (portales, dashboards, sistemas internos)
- Apps móviles iOS y Android (React Native, Flutter, publicación en tiendas)
- Inteligencia Artificial integrada (chatbots, automatización, análisis predictivo)
- E-commerce y tiendas online (Shopify, headless, pasarelas de pago)
- Infraestructura cloud y seguridad (AWS, Vercel, SSL, arquitectura escalable)
- SEO técnico y posicionamiento (Core Web Vitals, Schema, Analytics)
- Automatización y CRM (HubSpot, WhatsApp API, Zapier, flujos automáticos)
- Branding digital y UI/UX (Figma, Design Systems, UX Research)

REGLAS IMPORTANTES:
- NUNCA des precios ni rangos de precio.
- NUNCA hagas promesas de tiempo o fechas de entrega.
- SÍ transmite que la velocidad es un valor central de ORMUZ sin comprometerte con tiempos exactos.
- Asesora sobre qué solución se adapta mejor al proyecto del cliente.
- Si el cliente tiene dudas técnicas, respóndelas con claridad y seguridad.

FLUJO DE CONVERSACIÓN:
1. Saluda con calidez y pregunta en qué puede ayudar.
2. Escucha y entiende la necesidad del cliente.
3. Asesora con profundidad sobre qué solución le conviene y por qué.
4. Genera visión: ayúdalo a imaginar su proyecto funcionando.
5. Cuando el cliente esté interesado di: "Para que nuestro equipo pueda darte seguimiento personalizado, ¿me compartes algunos datos?"
6. Pide en orden natural: nombre completo → correo electrónico → número de teléfono → pregunta si tiene WhatsApp en ese número.
7. Al final haz un resumen breve de lo que necesita.
8. Cuando tengas TODOS los datos (nombre, correo, teléfono, whatsapp sí/no, resumen del proyecto), incluye al final de tu respuesta exactamente este bloque:
[LEAD:nombre|correo|telefono|whatsapp|resumen_proyecto]`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM,
        messages: messages
      })
    });

    const claudeData = await claudeRes.json();
    if (!claudeRes.ok) {
      return res.status(500).json({ error: claudeData.error?.message || 'Error Claude API' });
    }

    const reply = claudeData.content[0].text;

    // Detectar lead completo
    const leadMatch = reply.match(/\[LEAD:([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/);

    if (leadMatch) {
      const [, nombre, correo, telefono, whatsapp, proyecto] = leadMatch;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'ORMUZ IA <onboarding@resend.dev>',
          to: ['ormuzdetec@gmail.com'],
          subject: `🚀 Nuevo Lead ORMUZ — ${nombre}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f4f0;padding:40px 32px;border-radius:8px;">
              <div style="margin-bottom:32px;">
                <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:8px;">ORMUZ · NUEVO LEAD</div>
                <div style="font-size:28px;font-weight:700;color:#0a0a0a;letter-spacing:-0.5px;">Nuevo contacto interesado</div>
              </div>
              <div style="background:#fff;border-radius:6px;padding:24px;margin-bottom:24px;border:1px solid #e8e8e4;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;width:120px;">Nombre</td><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;font-weight:600;color:#0a0a0a;">${nombre}</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;">Correo</td><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;color:#0a0a0a;"><a href="mailto:${correo}" style="color:#0a0a0a;">${correo}</a></td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;">Teléfono</td><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;color:#0a0a0a;">${telefono}</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;">WhatsApp</td><td style="padding:10px 0;border-bottom:1px solid #f0f0ee;color:#0a0a0a;">${whatsapp}</td></tr>
                  <tr><td style="padding:10px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;vertical-align:top;">Proyecto</td><td style="padding:10px 0;color:#0a0a0a;">${proyecto}</td></tr>
                </table>
              </div>
              <div style="text-align:center;">
                <a href="mailto:${correo}" style="display:inline-block;background:#0a0a0a;color:#fff;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;text-decoration:none;border-radius:2px;">Contactar ahora</a>
              </div>
              <div style="margin-top:32px;font-size:10px;color:#bbb;text-align:center;letter-spacing:1px;">ORMUZ · IA SYSTEM · CANCÚN, MÉXICO</div>
            </div>
          `
        })
      });
    }

    // Limpiar bloque [LEAD:...] de la respuesta visible
    const cleanReply = reply.replace(/\[LEAD:[^\]]+\]/g, '').trim();

    return res.status(200).json({ reply: cleanReply });

  } catch (err) {
    return res.status(500).json({ error: 'Error interno: ' + err.message });
  }
}
