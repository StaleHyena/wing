const express = require('express');
const app = express();
const socket = require('socket.io');
const process = require('process');
const server = app.listen(8080);
const io = socket(server);
const __import__demos = require('./public/demos.js');
const demos = __import__demos.demos;

app.use(express.static('public'));

let vals = [0,0];
let demo = demos[0].name; // hard-coded default

io.sockets.on('connection', (socket) => {
  socket.emit('vals', vals);
  socket.emit('demo', demo);
  console.log('new connection: ' + socket.id);

  socket.on('vals', (v) => {
    vals = v;
    socket.broadcast.emit('vals', vals);
  });
  socket.on('demo', (d) => {
    demo = d;
    socket.broadcast.emit('demo', demo);
  });
});

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

