let socket;
let packetData;
let netError;

let ui_div;
let playpause_btn;
let graph_sel;
let demo_sel;
let step_slider;
let clientCount_p;
let ui_elts;

let step_max;

let cur_graph;
let cur_demo;
let num_clients;

let graph_d;
let scrubbing;
let scrub_pos;
let scrub_step;

let mousePressed;
let mouseGracePeriod;

// Just because it's used in the ui file code too
function emitData(name, data = undefined) {
  if(socket.connected) {
    socket.emit(name, data);
  } else if(!netError) {
    console.error('Error: no connection!');
    net_error = true;
  }
}

