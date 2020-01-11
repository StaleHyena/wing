import p5 from "p5";
import { Graph, ExprMan, Seekbar, GraphSpace } from "./graph.js";
import ui from "./ui.js";
import net from "./net.js";
import { create, all } from 'mathjs/number'

const math = create(all);
let canvas;
let aspect_ratio;
let graph;
let need_redraw;

// States related to user input
let leftMousePressed;
let mouseGracePeriod;
// States for graph panning
let panning;
let start_pan_pos;
let last_pan_diff;

let scroll_factor = 0.1; // Graph zooming

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
    ui.addCallback('demo', (d) => { net.emitData('demo', d.name); });
    ui.addCallback('step', (v) => {
      if(graph) {
        let max_vel = graph.seekbar.max_vel;
        let step = p.map(v, 0.0,1.0, 0.0,max_vel);
        graph.seekbar.setVel(step);
      }
    });
    ui.addCallback('play/pause', () => {
      if(!graph) { return; }
      graph.seekbar.playing ^= true;
      mouseGracePeriod = 20;
    });
    ui.addCallback('expr', expr);

    net.init();
    net.addCallback('connect',
      () => { ui.updateStatus("Conectado", "#34eb77"); });
    net.addCallback('clients',
      (count) => { ui.updateClientCount(count); });
    net.addCallback('accepted',
      () => { ui.post(); });
    net.addCallback('denied',
      () => { ui.updateStatus("Pedido de admin recusado", "#ff0000"); });
    net.addCallback('revoked',
      () => { ui.updateStatus("Privilégios de admin revogados", "#cc0000"); });

    // Feed config JSON to graph
    fetch("/graphconf.json")
      .then((res) => res.json())
      .then((conf) => {
        let ranges = conf["default-ranges"];
        let gspace = new GraphSpace();
        gspace.setMin(ranges.min);
        gspace.setMax(ranges.max);
        gspace.unit = ranges.unit;
        graph = new Graph(p.width,p.height, gspace, conf);
        window.graph = graph;
        panning = false;
        need_redraw = false;
        graph.updateGrid();
        graph.add(
          {
            clr: graph.pallete.trace,
            func:(x) => { return 0; },
          }
        );
        ui.post();
      });

    leftMousePressed = false;
    mouseGracePeriod = 0;
  }

  p.draw = function() {
    if(graph) {
      graph.update();

      if(leftMousePressed) {
        let selx = graph.disToSpace({'x':p.mouseX,'y':0}, true).x;
        if(selx) {
          graph.seekbar.setX(selx);
        }
      }
      else if(panning) {
        panGraph(p.mouseX, p.mouseY);
      }
      if(need_redraw) {
        graph.updateGrid();
        graph.drawExprs();
        need_redraw = false;
      }
      if(mouseGracePeriod > 0) {
        mouseGracePeriod -= 1;
      }
      let v = graph.seekbar.getVals(graph.exprman);
      if(v && v[0]) {
        net.emitData('vals', [graph.seekbar.x,v[0]]);
      }

      graph.draw(0,0);
    } else {
      p.background(0);
      p.fill(255);
      p.textAlign(p.CENTER);
      p.text("Sem gráfico!", p.width/2, p.height/2);
    }
  }
}
function panGraph(mx,my) {
  if(graph) {
    if(last_pan_diff) {
      graph.space.pan(last_pan_diff.copy().mult(-1));
    }
    let mouse_pos = p.createVector(mx,my);
    mouse_pos = graph.display_space.map(mouse_pos, graph.space);
    let diff = p.createVector(0,0);
    diff.x = start_pan_pos.x - mouse_pos.x;
    diff.y = start_pan_pos.y - mouse_pos.y;

    graph.space.pan(diff);
    need_redraw = true;
    last_pan_diff = diff.copy();
  }
}
function zoomGraph(z) {
  if(graph) {
    graph.space.zoom(z);
    need_redraw = true;
  }
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
      if(!panning && graph) {
        // Setup state machine for panning
        // --really-- ugly code, the whole panning thing
        let mp = p.createVector(p.mouseX, p.mouseY);
        let sp = graph.display_space.map(mp, graph.space);
        start_pan_pos = p.createVector(sp.x, sp.y);
        last_pan_diff = undefined;
        panning = true;
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
    zoomGraph(ev.deltaY*scroll_factor);
  }
}

new p5(sketch);

