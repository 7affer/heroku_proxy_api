const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const cluster = require('cluster');
const sticky = require('socketio-sticky-session');

const processesNum = process.env.PM2_JOBS || 4;
const port = process.env.PORT || '8080';

const options = {
  proxy: true, //activate layer 4 patching
  header: 'x-forwarded-for', //provide here your header containing the users ip
  num: processesNum, //count of processes to create, defaults to maximum if omitted
  sync: {
    isSynced: true, //activate synchronization
    event: 'mySyncEventCall' //name of the event you're going to call
  }
}

const stickyServer = sticky(options, workerProcess);

stickyServer.on('connection', socket => {
  console.log('sticky socket connected');
  socket.emit('hello', { message: 'world 2' });
  setInterval(() => socket.emit('hello', { message: `time2: ${Date.now()}` }), 3000);
}).listen(3000, function() {
  console.log('server started on 3000 port');
});

// if (cluster.isMaster) {
//   for (let i = 0; i < processesNum; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`Worker ${worker} died with code ${code} and signal ${signal}`);
//     console.log('Restarting worker');
//     cluster.fork();
//   });

// } else {
//   workerProcess();
// }

function workerProcess() {
  const app = express();
  app.use('/api', (req, res) => {
    res.status(200).send('api response');
  });
  app.set('port', port);
  const server = http.createServer(app);
  const io = socketIO(server);
  io.listen(server, {
    transports: [
      'websocket',
      'polling',
      'long-polling',
    ]
  });
  io.on('connection', socket => {
    console.log('socket connected');
    socket.emit('hello', { message: 'world' });
    setInterval(() => socket.emit('hello', { message: `time: ${Date.now()}` }), 3000);
  });
  app.set('io', io);
  server.listen(port);
  console.log(`server started at port: ${port} worker: ${cluster.worker.id}`);

  return server;
}
