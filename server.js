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
const  admin_dir = path.join(__dirname, 'admin');
const client_dir = path.join(__dirname, 'client');
const assets_dir = path.join(__dirname, 'assets');
const   libs_dir = path.join(__dirname, 'libs');

let vals = [0,0];
let demo = ""; // hard-coded default
let admin_socket = -1;

function setupTUI() {
  setInterval(printVals, 500);
  let stdin = process.stdin;
  stdin.setEncoding('utf8');
  stdin.resume();
  stdin.on('data', (raw_chunk) => {
    let chunk = raw_chunk.trim();
    if(chunk == 'q' || chunk == 'quit') {
      console.log('quitting...');
      process.exit();
    } else if(chunk == 'l' || chunk == 'list') {
      printClients();
    } else if(chunk == 'r' || chunk == 'reset') {
      admin_socket = -1;
      console.log('waiting new admin...');
    }
  });
  console.log("Enter 'q' to quit, 'l' to show client list, or 'r' to clear admin.");
}

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
        emitClientsAdmin();

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
        socket.emit('denied');
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

  function emitClientsAdmin() {
    if(admin_socket != -1) {
      io.to(admin_socket).emit('clients', io.engine.clientsCount - 1);
    }
  }
}

let statSymbols = ['|','/','-','\\'];
let statCounter = 0;
function printVals() {
  let x = Math.round(vals[0]*1000)/1000;
  let y = Math.round(vals[1]*1000)/1000;
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

function printClients() {
  let n = io.engine.clientsCount;
  if(n > 0) {
    console.log(
      'There ' + ((n > 1)? 'are ':'is ') + n +
      ' client' + ((n > 1)? 's ':' ') + 'connected.'
    );
  } else {
    console.log('There are no clients connected.');
  }

  // https://stackoverflow.com/a/24145381
  function connClients(roomId, namespace) {
    let res = [];
    // the default namespace is "/"
    let ns = io.of(namespace ||"/");

    if (ns) {
      for (var id in ns.connected) {
        if(roomId) {
          var index = ns.connected[id].rooms.indexOf(roomId);
          if(index !== -1) {
            res.push(ns.connected[id]);
          }
        } else {
          res.push(ns.connected[id]);
        }
      }
    }
    return res;
  }

  connClients().forEach((v) => {
    let is_admin = v.id == admin_socket;
    console.log(v.id + ((is_admin)? ' (admin)':''));
  });
}

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

// "Main"

setupTUI();
setupNet();

app.use('/admin',  express.static(admin_dir));
app.use('/libs',   express.static(libs_dir));
app.use('/client', express.static(client_dir));
app.use(favicon(path.join(assets_dir, 'favicon.ico')));
app.all('/', (req, res) => {
  res.redirect('/client');
});
// Specific files
const graphconf = path.join(assets_dir, 'graphconf.json');
app.get('/graphconf.json', (req, res) => {
  res.sendFile(graphconf);
});

