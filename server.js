const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const socket = require('socket.io');
const process = require('process');

const conf = fetchConfig();
const server = app.listen(conf.port);
const io = socket(server);

app.use('/admin', express.static('admin'));
app.use('/libs', express.static('libs'));
app.use('/client', express.static('client'));
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));
app.all('/', (req, res) => {
  res.redirect('/client');
});

let vals = [0,0];
let demo = ""; // hard-coded default
let admin_socket = -1;

function setupNet() {
  io.sockets.on('connection', (socket) => {
    emitClientsAdmin();
    socket.emit('vals', vals);
    socket.emit('demo', demo);
    console.log('Socket ' + socket.id + ' has connected.');

    socket.on('admin', () => {
      if(admin_socket == -1) {
        admin_socket = socket.id;
        console.log(socket.id + ' is the new admin.');

        socket.on('vals', (v) => {
          vals = v;
          socket.broadcast.volatile.emit('vals', vals);
        });
        socket.on('demo', (d) => {
          demo = d;
          socket.broadcast.volatile.emit('demo', demo);
        });
      } else {
        console.log(socket.id + ' failed to become admin.');
        socket.disconnect();
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
      emitClientsAdmin();
    });
  });
}

setupNet();

let statSymbols = ['|','/','-','\\'];
let statCounter = 0;

function printVals() {
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

function emitClientsAdmin() {
  if(admin_socket != -1) {
    io.to(admin_socket).emit('clients', io.engine.clientsCount - 1);
  }
}

setInterval(printVals, 500);

function fetchConfig() {
  const filename = "config.json";
  const fallback = "default-config.json";
  if(fs.existsSync(filename)) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } else {
    console.log(
      "\"" + filename + "\"" + 
      " not found, using \"" + fallback + "\"" +
      " instead."
    );
    return JSON.parse(fs.readFileSync(fallback, 'utf8'));
  }
}
