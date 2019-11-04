import p5 from "p5/lib/p5.min.js";
import Graph from "./graph.js";
import ui from "./ui.js";
import Net from "./net.js";
import { create, all } from 'mathjs/number'

const math = create(all);
let canvas;
let net;
let num_clients;

let cur_demo;
let cur_expr;

let graph;
let scrubbing;
let scrub_pos;
let scrub_step;
let step_max;

let mousePressed;
let mouseGracePeriod;

const sketch = (p) => {
  p.setup = function() {
    let div = p.select('#p5canvas-holder');
    let ds = div.size();
    canvas = p.createCanvas(ds.width, ds.height);
    canvas.parent(div);
    canvas.mousePressed(onMousePressed);
    canvas.mouseReleased(onMouseReleased);

    window.p = p; // Make it accessible globally

    graph = new Graph(p.width,p.height);
    graph.updateRanges([p.PI/2,1, -p.PI,5*p.PI, -4,4]);
    graph.updateGrid();
    graph.addGraph(
      {
        id: 0,
        color: graph.pallete.trace,
        func:(x) => { return 0; },
      }
    );
    graph.addGraph(
      {
        id: 1,
        color: p.color(255,10,50),
        func: (x) => { return 100; }, // Out of sight out of mind
      }
    );

    num_clients = 0;

    mousePressed = false;
    mouseGracePeriod = 0;
    scrubbing = false;
    scrub_pos = graph.displayOrigin.x;
    step_max = p.width/40;

    cur_expr = undefined;

    ui.init();
    ui.addCallback('demo', updateDemo);
    ui.addCallback('step', updateStep);
    ui.addCallback('play/pause', playpause);
    ui.addCallback('expr', expr);

    net = new Net(
      function onConnect() {
        ui.ready();
      },
      function onClient(c) {
        num_clients = c;
        ui.updateClientCount(num_clients);
      }
    );
  }

  p.draw = function() {
    if(cur_expr) {
      let selx = getX();
      // x can come from mouse, from scrubber or not come at all
      if(selx) {
        graph.selectDisp(selx);
        let v = graph.getSelection();
        net.emitData('vals', [v.x,v.y]);
      }

      if(scrubbing) {
        scrub_pos += scrub_step;
        if(scrub_pos > graph.ranges.display.max.x) {
          scrub_pos = graph.ranges.display.min.x;
        }
      }
      else if(mouseGracePeriod > 0) {
        mouseGracePeriod -= 1;
      }
      p.image(graph.static_gb,0,0);
      p.image(graph.trace_gb,0,0);
      p.image(graph.marks_gb,0,0);
    } else {
      p.background(0);
      p.fill(255);
      p.textAlign(p.CENTER);
      p.text("Sem gráfico!", p.width/2, p.height/2);
    }
  }

  p.keyPressed = function() {
    if(p.keyCode == 32) { //spacebar
      playpause();
    }
  }
}

function getX() {
  if(scrubbing) {
    return scrub_pos;
  } else if (mousePressed) {
    scrub_pos = p.mouseX;
    return p.mouseX;
  }
  return undefined;
}

function updateDemo(d) { cur_demo = d; net.emitData('demo', d.name); }
function updateStep(v) {
  scrub_step = p.map(p.pow(v,3), 0.0,1.0, 0.0,step_max);
}
function playpause() {
  scrubbing = !scrubbing;
  mouseGracePeriod = 20;
}
function expr(e, id) {
  cur_expr = e;
  let g = graph.getGraphById(id);
  if(g) {
    g.func = (x) => {
      try {
        return e.evaluate({'x':x});
      } catch (err) {
        return 0;
      }
    };
    graph.drawGraphs();
  }
}

function onMousePressed() {
  let t = mouseGracePeriod == 0 && p.mouseIsPressed;
  if(t) {
    mousePressed = true;
  } else {
    mousePressed = false;
  }
}

function onMouseReleased() {
  mousePressed = false;
}

new p5(sketch);

