const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const sticky = require('socketio-sticky-session');

const app = express();
const port = process.env.PORT || '8080';

var stickySessionOptions = {
  proxy: true, //activate layer 4 patching
  header: 'x-forwarded-for', //provide here your header containing the users ip
  num: 4, //count of processes to create, defaults to maximum if omitted
}

app.use('/api', (req, res) => {
  res.status(200).send('api response');
});

app.set('port', port);

const stictyServer = sticky(options, () => {
  const server = http.createServer(app);

  const io = socketIO(server);

  io.listen(server);

  io.on('connection', socket => {
    console.log('socket connected');
    socket.emit('hello', { message: 'world' });
  });

  app.set('io', io);

  return server;
});

stictyServer.listen(port);

module.exports = server;