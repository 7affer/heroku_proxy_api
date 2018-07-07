const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
const port = process.env.PORT || '8080';

app.use('/api', (req, res) => {
  res.status(200).send('api response');
});

app.set('port', port);


const server = http.createServer(app);

const io = socketIO(server);

io.listen(server, {transports: [
  'websocket',
  'polling',
  'long-polling',
]});

io.on('connection', socket => {
  console.log('socket connected');
  socket.emit('hello', { message: 'world' });

  setInterval(
    () => socket.emit('hello', {message: `time: ${Date.now()}`}),
    3000,
  )
});

app.set('io', io);

server.listen(port);

module.exports = server;