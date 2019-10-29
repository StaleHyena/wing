const express = require('express');
const app = express();
const socket = require('socket.io');
const process = require('process');
const server = app.listen(8080);
const io = socket(server);
const __import__demos = require('./client/demos.js');
const demos = __import__demos.demos;

app.use('/admin', express.static('admin'));
app.use('/libs', express.static('libs'));
app.use('/client', express.static('client'));
app.all('/', (req, res) => {
  res.redirect('/client');
});

let vals = [0,0];
let demo = demos[0].name; // hard-coded default
let admin_socket = -1;

function setupNet() {
  io.sockets.on('connection', (socket) => {
    socket.emit('vals', vals);
    socket.emit('demo', demo);
    console.log('Socket ' + socket.id + ' has connected.');

    socket.on('admin', (d, ack_func) => {
      if(admin_socket == -1) {
        admin_socket = socket.id;
        console.log(socket.id + ' is the new admin.');
        ack_func(true);

        socket.on('vals', (v) => {
          vals = v;
          socket.broadcast.emit('vals', vals);
        });
        socket.on('demo', (d) => {
          demo = d;
          socket.broadcast.emit('demo', demo);
        });
      } else {
        console.log(socket.id + ' failed to become admin.');
        ack_func(false);
      }
    });

    socket.on('disconnect', (reason) => {
      let s = 'Socket ' + socket.id;
      if(socket.id == admin_socket) {
        s += ' (admin)';
        admin_socket = -1;
      }
      s += ' has disconnected -- ' + reason;
      console.log(s);
    });
  });
}

setupNet();

let statSymbols = ['|','/','-','\\'];
let statCounter = 0;

printVals = function() {
  let x = Math.round(vals[0]*1000)/1000;
  let y = Math.round(vals[1]*1000)/1000;
  //let x = vals[0];
  //let y = vals[1];
  process.stdout.write(
    '(' + x + ',' + y + ')' +
    ', demo: ' + demo + ' ' +
    statSymbols[statCounter] + '\r'
  );

  statCounter++;    
  if(statCounter >= statSymbols.length) {    
    statCounter = 0;    
  }
}

setInterval(printVals, 500);
setInterval(()=>{io.emit('clients', io.engine.clientsCount);},500);

