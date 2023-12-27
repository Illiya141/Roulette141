const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3000;

app.use(bodyParser.json());

const userBalance = {};

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Serve static files from the specified directory
const staticFilesPath = '/Users/illiyaroshangah/Documents/roulette/Some-Roulette-game/frontend';
app.use(express.static(staticFilesPath));

app.get('/balance/:userID', (req, res) => {
  const userID = req.params.userID;
  const balance = userBalance[userID];
  res.json({ userID, balance });
});

app.post('/transaction', (req, res) => {
  const { userID, amount, type } = req.body;

  if (!userID || !amount || !type) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  if (type === 'deposit') {
    userBalance[userID] = (userBalance[userID] || 0) + amount;
  } else if (type === 'withdraw') {
    const currentBalance = userBalance[userID] || 0;
    if (currentBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    userBalance[userID] -= amount;
  } else {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  broadcast({ type: 'balanceUpdate', userId: userID, balance: userBalance[userID] });

  res.json({ success: true });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'initialBalances', balances: userBalance }));
  
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

wss.on('connection', (ws) => {
  console.log('Incoming connection...');
});

// Route for /roulette
app.get('/roulette', (req, res) => {
  res.sendFile(path.join(staticFilesPath, 'index.html'));
});

setInterval(() => {
  const computed_random_number = Math.floor(Math.random() * 14);

  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(computed_random_number);
    }
  });
}, 10000);
