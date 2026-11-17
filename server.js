const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;
const VERIFY = process.env.VERIFY_TOKEN || 'escaneando123';

// Verificação do webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Receber mensagem e responder
app.post('/webhook', async (req, res) => {
  try {
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (msg) {
      const from = msg.from;
      const text = msg.text?.body?.toLowerCase() || '';

      let reply = 'Oi! Sou do Escaneando Futuros 🤖\n\nDigite:\n1 - Agendar\n2 - Preço\n3 - Falar com atendente';

      if (text.includes('1') || text.includes('agendar')) reply = 'Beleza! Qual dia você quer agendar? Me manda o dia e o horário.';
      if (text.includes('2') || text.includes('preço') || text.includes('preco')) reply = 'Nossos valores variam por exame. Qual exame você precisa?';
      if (text.includes('3')) reply = 'Vou chamar um atendente pra você, só um minuto...';

      await axios.post(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: reply }
      }, { headers: { Authorization: `Bearer ${TOKEN}` } });
    }
  } catch (e) { console.log(e.response?.data || e.message); }
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('Bot Escaneando Futuros online!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Rodando na porta ' + PORT));