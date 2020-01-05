import p5 from "p5";
import socketio from "socket.io-client";
import { demos, demoFromName } from './demos.js'

let socket;
let vals;
let demo;
let persistent_mem;

const sketch = (p) => {
  p.setup = function() {
    p.createCanvas(window.innerWidth, window.innerHeight);
    demo = demos[0];
    vals = [0,0]
    setupNet(p);
    p.background(0);
  }

  p.draw = function() {
    if(demo != null) {
      let f = demo.f;
      f(p, vals, persistent_mem);
    } else {
      p.fill(255);
      p.textAlign(p.CENTER);
      p.text("Demo desconhecida!", p.width/2, p.height/2);
    }
  }
}

function setupNet(p) {
  socket = socketio();
  socket.on('vals', (v) => {
    vals = v;
  });
  socket.on('demo', (d) => {
    // No need to change if already on it
    if(demo != null && d.name == demo.name) { return; }

    demo = demoFromName(d);
    persistent_mem = {};
    if(demo != null && demo.hasOwnProperty('setup')) {
      demo.setup(p, persistent_mem);
    }
  });
}

new p5(sketch);

