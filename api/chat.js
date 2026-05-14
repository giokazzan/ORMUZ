export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `Eres la IA de ORMUZ Desarrollo y Tecnología, una empresa de tecnología en Cancún, México.
Tu misión es conocer al visitante, entender qué necesita y capturar su información de contacto para que el equipo de ORMUZ le dé seguimiento.

REGLAS:
1. Sé amable, profesional y conciso. Máximo 2-3 oraciones por respuesta.
2. Habla en español siempre.
3. Guía la conversación en este orden natural: saludo → conocer su nombre → entender su necesidad → conocer su empresa → solicitar su correo.
4. No pidas todo de golpe. Ve paso a paso, naturalmente.
5. Cuando tengas nombre, necesidad y correo, incluye al final exactamente: [LEAD:nombre|necesidad|correo]
6. Si preguntan sobre servicios menciona: sitios web, apps móviles, IA, automatización, e-commerce, SEO.
7. Tono: inteligente, directo, cálido.`,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Error de API' });
    }

    return res.status(200).json({
      reply: data.content[0].text
    });

  } catch (err) {
    return res.status(500).json({ error: 'Error interno: ' + err.message });
  }
}
