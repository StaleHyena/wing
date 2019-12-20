import p5 from "p5";
import { Graph, ExprMan, Seekbar, GraphSpace } from "./graph.js";
import ui from "./ui.js";
import net from "./net.js";
import { create, all } from 'mathjs/number'

const math = create(all);
let canvas;
let num_clients;
let aspect_ratio;

let cur_demo;

let graph;
let scrub_step;
let step_max;

let pan;
let panning;
let ranges;
let p_ranges;
let dirtyRanges;
let start_pointerPos;

let leftMousePressed;
let mouseGracePeriod;

const sketch = (p) => {
  p.setup = function() {
    let div = p.select('#p5canvas-holder');
    let ds = div.size();
    canvas = p.createCanvas(ds.width, ds.height);
    canvas.parent(div);
    canvas.mousePressed(onMousePressed);
    canvas.mouseReleased(onMouseReleased);
    canvas.mouseWheel(onMouseWheel);
    aspect_ratio = p.width/p.height;

    window.p = p; // Make it accessible globally

    ui.init();
    ui.addCallback('demo', updateDemo);
    ui.addCallback('step', updateStep);
    ui.addCallback('play/pause', playpause);
    ui.addCallback('expr', expr);

    net.init();
    net.addCallback('connect',
      () => { ui.updateStatus("Conectado", "#34eb77"); });
    net.addCallback('clients',
      (c) => { num_clients = c; ui.updateClientCount(num_clients); });
    net.addCallback('denied',
      () => { ui.updateStatus("Pedido de admin recusado", "#ff0000"); });
    net.addCallback('revoked',
      () => { ui.updateStatus("Privilégios de admin revogados", "#cc0000"); });

    // Feed config JSON to graph
    fetch("/graphconf.json")
      .then((res) => res.json())
      .then((conf) => {
        ranges = conf["default-ranges"];
        let gspace = new GraphSpace();
        gspace.setMin(ranges.min);
        gspace.setMax(ranges.max);
        gspace.unit = ranges.unit;
        graph = new Graph(p.width,p.height, gspace, conf);
        window.graph = graph;
        panning = false;
        dirtyRanges = false;
        graph.updateGrid();
        graph.add(
          {
            clr: graph.pallete.trace,
            func:(x) => { return 0; },
          }
        );
        step_max = graph.space.width/40;
        ui.ready();
      });

    num_clients = 0;

    leftMousePressed = false;
    mouseGracePeriod = 0;
  }

  p.draw = function() {
    if(graph) {
      graph.update();

      let selx = graph.disToSpace({'x':getX(),'y':0}, true).x;
      if(selx) {
        graph.seekbar.setX(selx);
      }

      if(panning) {
        panGraph(p.mouseX, p.mouseY);
      }
      if(dirtyRanges) {
        graph.updateRanges(ranges);
        graph.updateGrid();
        graph.drawExprs();
        dirtyRanges = false;
      }
      else if(mouseGracePeriod > 0) {
        mouseGracePeriod -= 1;
      }
      
      let seekb = graph.seekbar;
      let v = seekb.getVals(graph.exprman);
      if(v && v[0]) {
        net.emitData('vals', [seekb.x,v[0]]);
      }

      graph.draw(0,0);
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
  if(leftMousePressed) {
    return p.mouseX;
  }
  return undefined;
}

function panGraph(x,y) {
  if(graph) {
    const dx = (x - start_pointerPos.x)/50;
    const dy = (y - start_pointerPos.y)/50;
    if(dx || dy) {
      ranges.min.x = p_ranges.min.x - dx;
      ranges.max.x = p_ranges.max.x - dx;
      ranges.min.y = p_ranges.min.y - dy;
      ranges.max.y = p_ranges.max.y - dy;
      dirtyRanges = true;
    }
  }
}

function zoomGraph(z) {
  if(graph) {
    if(z) {
      const ratio = graph.space.width/graph.space.height;
      ranges.min.x = ranges.min.x - z * ratio;
      ranges.max.x = ranges.max.x + z * ratio;
      ranges.min.y = ranges.min.y - z;
      ranges.max.y = ranges.max.y + z;
      dirtyRanges = true;
    }
  }
}

function updateDemo(d) { cur_demo = d; net.emitData('demo', d.name); }
function updateStep(v) {
  if(graph) {
    let step = p.map(p.pow(v,3), 0.0,1.0, 0.0,step_max);
    graph.seekbar.setVel(step);
    console.log(`step:${step}`);
  }
}
function playpause() {
  if(!graph) { return; }
  graph.seekbar.playing ^= true;
  mouseGracePeriod = 20;
}
function expr(e, label) {
  if(graph) {
    let expr_obj = graph.exprman.expr_map.get(label);
    if(expr_obj) {
      expr_obj.func = (x) => {
        try {
          return e.evaluate({'x':x});
        } catch (err) {
          return 0;
        }
      };
      graph.drawExprs();
    }
  }
}

function onMousePressed() {
  let t = mouseGracePeriod == 0 && p.mouseIsPressed;
  if(t) {
    if(p.mouseButton == p.LEFT) {
      leftMousePressed = true;
    } else if(p.mouseButton == p.CENTER) {
      if(!panning) {
        start_pointerPos = p.createVector(p.mouseX, p.mouseY);
        p_ranges = {
          unit: {
            x:ranges.unit.x,
            y:ranges.unit.y,
          },
          min: {
            x:ranges.min.x,
            y:ranges.min.y,
          },
          max: {
            x:ranges.max.x,
            y:ranges.max.y,
          },
        };
        panning = true;
        console.log('init', p_ranges, start_pointerPos);
      }
    }
  } else {
    leftMousePressed = false;
  }
}

function onMouseReleased() {
  leftMousePressed = false;
  panning = false;
}

function onMouseWheel(ev) {
  if(ev.deltaY) {
    zoomGraph(ev.deltaY*0.1);
  }
}

new p5(sketch);

