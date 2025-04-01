export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }
  
    const { messages } = req.body;
  
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'incidencias-chatbot',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct', // Gratis y bueno
          messages,
        }),
      });
  
      const data = await response.json();
  
      if (data.error) {
        console.error('🛑 Error desde OpenRouter:', data.error);
        return res.status(500).json({ error: 'Error desde OpenRouter', detalle: data.error });
      }
  
      if (!data.choices || !data.choices[0]?.message) {
        console.warn('⚠️ Respuesta sin choices válidos:', data);
        return res.status(500).json({ error: 'Respuesta inválida del bot', detalle: data });
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error('💥 Error en chatbot API local:', error);
      res.status(500).json({ error: 'Error al conectar con OpenRouter' });
    }
  }
  