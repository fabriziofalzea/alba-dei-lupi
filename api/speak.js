// Vercel Serverless Function: proxy ElevenLabs TTS
// La API key vive in Vercel → Environment variables → ELEVENLABS_API_KEY
// La voice ID vive in ELEVENLABS_VOICE_ID (opzionale, default: Daniel)

const DEFAULT_VOICE = 'onwK4e9ZLuTAKqWW03F9'; // Daniel

// Solo le voci offerte dall'app: senza questa lista chiunque puo' usare
// qualsiasi voce dell'account ElevenLabs passando un id arbitrario.
const ALLOWED_VOICES = new Set([
  'onwK4e9ZLuTAKqWW03F9', // Daniel
  'TX3LPaxmHKxFdv7VOQHJ', // Liam
  'pqHfZKP75CvOlQylNhV4', // Bill
  'N2lVS1w4EtoT3dr4eOWO', // Callum
  'XB0fDUnXU5powFXDhCwa', // Charlotte
  'Xb7hH8MSUJpSbSDYk0k2', // Alice
]);

// Le frasi del narratore piu' lunghe stanno sotto i 300 caratteri.
const MAX_TEXT = 400;

export default async function handler(req, res) {
  // Preflight CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ElevenLabs non configurato sul server.' });
  }

  const { text = '', voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE } = req.body || {};

  if (!text.trim()) {
    return res.status(400).json({ error: 'Testo vuoto' });
  }

  if (text.length > MAX_TEXT) {
    return res.status(413).json({ error: 'Testo troppo lungo' });
  }

  if (!ALLOWED_VOICES.has(voiceId)) {
    return res.status(400).json({ error: 'Voce non consentita' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        speed: 1.4,
        voice_settings: {
          stability: 0.70,
          similarity_boost: 0.85,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs error:', response.status, err);
      return res.status(response.status).send(err);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).json({ error: 'Errore interno' });
  }
}
