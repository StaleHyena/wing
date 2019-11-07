import socketio from "socket.io-client";

class Network {
  constructor(onConnect = undefined, onClient = undefined) {
    this.socket = undefined;
    this.netError = false;
  }

  init(onConnect = undefined, onClient = undefined) {
    this.socket = socketio();
    this.socket.on('connect', () => {
      this.socket.on('clients', (c) => {
        if(onClient) {
          onClient(c);
        }
      });
      this.socket.on('disconnect', (reason) => {
        console.error('Disconnected from server -- ' + reason);
      });
      this.emitData('admin');
      if(onConnect){
        onConnect();
      }
    });
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

