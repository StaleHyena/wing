import p5 from "p5";
import socketio from "socket.io-client";
import { demos, demoFromName } from './demos.js'

let socket;
let vals;
let demo;
let custom_data;

const sketch = (p) => {
  p.setup = function() {
    p.createCanvas(window.innerWidth, window.innerHeight);
    demo = demos[0];
    vals = [0,0]
    setupNet();
    p.background(0);
    custom_data = {};
  }

  p.draw = function() {
    if(demo != null) {
      let f = demo.f;
      f(p, vals, custom_data);
    } else {
      p.fill(255);
      p.textAlign(p.CENTER);
      p.text("Demo desconhecida!", p.width/2, p.height/2);
    }
  }
}

function setupNet() {
  socket = socketio();
  socket.on('vals', (v) => {
    vals = v;
  });
  socket.on('demo', (d) => {
    demo = demoFromName(d);
  });
}

new p5(sketch);

