import socketio from "socket.io-client";

class Network {
  constructor(onConnect = undefined, onClient = undefined) {
    this.socket = undefined;
    this.netError = false;
    this.callbacks = new Map();
  }

  init() {
    this.socket = socketio();
    this.socket.on('connect', () => {
      this.socket.on('clients', (c) => {
        let onClient = this.callbacks.get('clients');
        if(onClient) {
          onClient(c);
        }
      });
      this.socket.on('disconnect', (reason) => {
        console.error('Disconnected from server -- ' + reason);
        let onDisconnect = this.callbacks.get('disconnect');
        if(onDisconnect) {
          onDisconnect(reason);
        }
      });
      this.socket.on('denied', () => {
        let onDenied = this.callbacks.get('denied');
        if(onDenied) {
          onDenied();
        }
      });
      this.socket.on('revoked', () => {
        let onRevoked = this.callbacks.get('revoked');
        if(onRevoked) {
          onRevoked();
        }
      });
      this.emitData('admin');
      let onConnect = this.callbacks.get('connect');
      if(onConnect) {
        onConnect();
      }
    });
  }
  
  addCallback(name, f) {
    this.callbacks.set(name, f);
  }

  emitData(name, data = undefined) {
    if(this.socket.connected) {
      this.socket.emit(name, data);
    } else if(!this.netError) {
      console.error('Error: no connection!');
      this.net_error = true;
    }
  }
}

let net = new Network();
export default net;

