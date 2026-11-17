const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFICADO');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  console.log('CHEGOU MENSAGEM:', JSON.stringify(req.body));
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const msg = value?.messages?.[0];
    if (msg) {
      const from = msg.from;
      const text = msg.text?.body || 'Oi';
      console.log('DE:', from, 'TEXTO:', text);
      await axios.post(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: 'Olá! 👋 Sou o Escaneando! Manda "Oi" de novo que eu tô online e te respondendo agora!' }
        },
        { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } }
      );
      console.log('RESPOSTA ENVIADA');
    }
  } catch (e) {
    console.log('ERRO AO RESPONDER:', e.response?.data || e.message);
  }
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('Bot online!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Rodando na porta ' + PORT));
