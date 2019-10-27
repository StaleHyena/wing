const express = require('express');
const app = express();
const socket = require('socket.io');
const process = require('process');
const server = app.listen(8080);
const io = socket(server);

app.use(express.static('public'));

let vals = [0,0];
let demo = 0;

io.sockets.on('connection', (socket) => {
  socket.emit('vals', vals);
  socket.emit('demo', demo);
  console.log('new connection: ' + socket.id);

  socket.on('vals', (v) => {
    vals[0] = v[0];
    vals[1] = v[1];
  });
  socket.on('demo', (d) => {
    demo = d;
  });
});

let statSymbols = ['|','/','-','\\'];
let statCounter = 0;

printVals = function() {
  //let roundx = Math.round(vals[0]*1000)/1000;
  //let roundy = Math.round(vals[1]*1000)/1000;
  let x = vals[0];
  let y = vals[1];
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

