const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const cluster = require('cluster');


if (cluster.isMaster) {
  const processesNum = process.env.PM2_JOBS || 4;

  for (let i = 0; i < processesNum; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker} died with code ${code} and signal ${signal}`);
    console.log('Restarting worker');
    cluster.fork();
  });

} else {
  const app = express();
  const port = process.env.PORT || '8080';

  app.use('/api', (req, res) => {
    res.status(200).send('api response');
  });

  app.set('port', port);
  const server = http.createServer(app);
  const io = socketIO(server);

  io.listen(server, {
    transports: [
      'websocket'
    ]
  });

  io.on('connection', socket => {
    console.log('socket connected');
    socket.emit('hello', { message: 'world' });

    setInterval(
      () => socket.emit('hello', { message: `time: ${Date.now()}` }),
      3000,
    )
  });

  app.set('io', io);
  server.listen(port);

  console.log(`server started at port: ${port} worker: ${cluster.worker.id}`);
}
