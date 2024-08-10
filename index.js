const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const clientsRouter = require('./backend/routes/clients');
const ioConfig = require('./backend/config/io'); // Importing the io config
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Creating the server using http

// Initialize io and use it for WebSocket connections
const io = ioConfig.init(server);

app.use(bodyParser.json());

app.use('/clients', clientsRouter);

app.get('/', (req, res) => {
  res.send('I am alive!');
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('New client connected');

  // Custom events go here
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is alive on port ${PORT}`));
