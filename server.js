const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Verificação do webhook - Meta chama isso pra testar
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFICADO!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recebe mensagem
app.post('/webhook', async (req, res) => {
  console.log('CHEGOU MENSAGEM:', JSON.stringify(req.body));
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const msg = value?.messages?.[0];
    if (!msg) return;

    const from = msg.from;
    let texto = '';

    if (msg.type === 'text') {
      texto = msg.text.body.toLowerCase();
    }

    let resposta = '';
    if (texto.includes('oi') || texto.includes('ola') || texto.includes('olá')) {
      resposta = 'Oi! Manda uma foto do seu exame que eu já analiso pra você 📸';
    } else if (msg.type === 'image') {
      resposta = 'Recebi sua foto! Já estou analisando... só um segundo.';
    } else {
      resposta = 'Oi! Manda uma foto do seu exame que eu já analiso pra você 📸';
    }

    await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
      messaging_product: 'whatsapp',
      to: from,
      type: 'text',
      text: { body: resposta }
    }, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
    });
    console.log('RESPONDEU:', resposta);
  } catch (e) {
    console.log('ERRO:', e.response?.data || e.message);
  }
});

app.get('/', (req, res) => res.send('Bot Escaneando ON'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Rodando na porta ' + PORT));
