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
let adminDemoSyncer = null;

function setupTUI() {
  setInterval(printVals, 500);
  let stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.setEncoding('utf8');
  stdin.resume();
  stdin.on('data', (key) => {
    if(key == 'q') {
      console.log('Quitting...');
      process.exit();
    } else if(key == 'l') {
      printClients();
    } else if(key == 'r') {
      revokeAdmin();
      console.log('Waiting new admin...');
    }
  });
  console.log("Press (q) to quit, (l) to show client list, or (r) to clear admin.");
}

function setupNet() {
  io.sockets.on('connection', (socket) => {
    emitClientsAdmin();
    socket.emit('vals', vals);
    socket.emit('demo', demo);
    console.log('CONN> Socket ' + socket.id + ' has connected.');

    adminEvents(socket);
    
    socket.on('disconnect', (reason) => {
      let s = 'DISCONN> Socket ' + socket.id;
      if(socket.id == admin_socket) {
        s += ' (admin)';
        clearAdmin();
      }
      s += ' has disconnected -- ' + reason;
      console.log(s);
      emitClientsAdmin();
    });
  });
}

function adminEvents(socket) {
  socket.on('admin', () => {
    if(admin_socket == -1) {
      admin_socket = socket.id;
      console.log(`ADMIN> ${socket.id} is the new admin.`);
      emitClientsAdmin();

      // Can't think of a reason why the if's should fail, but they are there.
      // FIXME maybe
      socket.on('vals', (v) => {
        if(socket.id == admin_socket) {
          vals = v;
          socket.broadcast.volatile.emit('vals', vals);
        }
      });
      socket.on('demo', (d) => {
        if(socket.id == admin_socket) {
          demo = d;
          socket.broadcast.emit('demo', d);
        }
      });

      socket.emit('accepted');
    } else {
      console.log(`ADMIN> ${socket.id} failed to become admin.`);
      socket.emit('denied');
      socket.disconnect();
    }
  });
}

function revokeAdmin() {
  if(admin_socket != -1) {
    io.to(admin_socket).emit('revoked');
    console.log('ADMIN> Revoked admin of ' + admin_socket);
    clearAdmin();
  } else {
    console.log('ADMIN> No admin to revoke!');
  }
}

function clearAdmin() {
  admin_socket = -1;
  console.log('ADMIN> There is now no admin.');
}

function emitClientsAdmin() {
  if(admin_socket != -1) {
    io.to(admin_socket).emit('clients', io.engine.clientsCount - 1);
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
    console.log('\t' + v.id + ((is_admin)? ' (admin)':''));
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
app.use('/assets/images', express.static(path.join(assets_dir,"images")));
app.use(favicon(path.join(assets_dir, 'favicon.ico')));
app.all('/', (req, res) => {
  res.redirect('/client');
});
// Specific files
const graphconf = path.join(assets_dir, 'graphconf.json');
app.get('/graphconf.json', (req, res) => {
  res.sendFile(graphconf);
});

