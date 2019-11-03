import p5 from "p5/lib/p5.min.js";
import socketio from "socket.io-client";
import { demos, demoFromName } from './demos.js'

let socket;
let vals;
let demo;

const sketch = (p) => {
  p.setup = function() {
    p.createCanvas(window.innerWidth, window.innerHeight);
    demo = demos[0];
    vals = [0,0]
    setupNet();
  }

  p.draw = function() {
    p.background(0);
    if(demo != null) {
      let f = demo.f;
      f(p, vals);
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

