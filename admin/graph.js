export default class Graph {
  constructor(w,h, config) {
    this.static_gb = p.createGraphics(w,h);
    this.trace_gb  = p.createGraphics(w,h);
    this.marks_gb  = p.createGraphics(w,h);
    this.origin = p.createVector();
    this.displayOrigin = p.createVector();
    this.scale_factor = p.createVector();
    this.selectedX = 0;
    this.continuity_threshold = 10000;
    this.pallete = config.pallete;
    this.style = config.style;

    //TODO: document this
    this.ranges = {
      'projection': {
        'min':{'x':0,'y':0},
        'max':{'x':0,'y':0},
        'width':0,
        'height':0,
      },
      'display': {
        'min':{'x':0,'y':0},
        'max':{'x':0,'y':0},
        'width':0,
        'height':0,
      },
      'unit': p.createVector(0,0),
    }

    this.exprman = new ExprMan();
    this.seekbar = new Seekbar(this);

    this.updateRanges({
      unit: { x:1,y:1 },
      min:  { x:1,y:1 },
      max:  { x:1,y:1 },
    });
    this.updateGrid();

    this.seekbar.bound_loop = true;
  }
  updateGrid() {
    let s_gb = this.static_gb;
    const r = this.ranges;
    s_gb.background(this.pallete.bg);

    const dispOrigin = this.displayOrigin;
    // axis
    {
      s_gb.strokeWeight(this.style.weights.axis);
      s_gb.stroke(this.pallete.axis);
      if(dispOrigin.x > r.display.min.x && dispOrigin.x < r.display.max.x) {
        s_gb.line(
          dispOrigin.x,r.display.min.y,
          dispOrigin.x,r.display.max.y
        );
      }
      if(dispOrigin.y > r.display.min.y && dispOrigin.y < r.display.max.y) {
        s_gb.line(
          r.display.min.x,dispOrigin.y,
          r.display.max.x,dispOrigin.y
        );
      }
    }

    let vert = [];

    // Populate vertices
    let x, y, c, off;
    x = p.max(0, r.projection.min.x);
    y = p.max(0, r.projection.min.y);
    // Keep aligned with origin
    off = p.createVector(x % r.unit.x, y & r.unit.y);
    do {
      x += r.unit.x;
      y += r.unit.y;
      vert.push(p.createVector(
          x - off.x,
          y - off.y
      ));
      c = (x < r.projection.max.x) || (y < r.projection.max.y);
      //c = c && vert.length < 2048; // cap size
    } while(c);

    x = p.min(0, r.projection.max.x);
    y = p.min(0, r.projection.max.y);
    // Keep aligned with origin
    off = p.createVector(x % r.unit.x, y & r.unit.y);
    do {
      x -= r.unit.x;
      y -= r.unit.y;
      vert.push(p.createVector(
          x - off.x,
          y - off.y
      ));
      c = (x > r.projection.min.x) || (y > r.projection.min.y);
      //c = c && vert.length < 2048; // cap size
    } while(c);

    // Convert to screen coords
    vert.forEach((elt, i, arr) => {
      arr[i] = this.projToDis({x: elt.x, y: elt.y}, true);
    });

    // Draw to screen
    s_gb.strokeWeight(this.style.weights.grid);
    s_gb.stroke(this.pallete.grid);

    vert.forEach((elt, i, arr) => {
      let up = r.display.min.y;
      let dw = r.display.max.y;
      let le = r.display.min.x;
      let ri = r.display.max.x;
      s_gb.line(elt.x,up, elt.x,dw);
      s_gb.line(le,elt.y, ri,elt.y);
    });
  }
  updateRanges(vals) {
    let s_gb = this.static_gb;
    let orig = this.origin;
    let w = s_gb.width;
    let h = s_gb.height;
    let r = this.ranges;

    r.unit.x = vals.unit.x;
    r.unit.y = vals.unit.y;
    //console.log('unit = '+unit.toString());

    {
      let rp = r.projection;
      rp.min.x  = vals.min.x;
      rp.max.x  = vals.max.x;
      rp.min.y  = vals.min.y;
      rp.max.y  = vals.max.y;
      rp.width  = rp.max.x - rp.min.x;
      rp.height = rp.max.y - rp.min.y;
    } {
      let rd = r.display;
      let pad = this.style.padding;
      rd.min.x = pad;
      rd.max.x = w - pad;
      rd.min.y = pad;
      rd.max.y = h - pad;
      rd.width  = rd.max.x - rd.min.x;
      rd.height = rd.max.y - rd.min.y;
    }

    this.origin = p.createVector(0,0);
    this.displayOrigin = this.projToDis(this.origin);

    this.scale_factor = p.createVector(
      r.display.width /r.projection.width,
      r.display.height/r.projection.height
    );
  }
  add(expr) {
    let label = this.exprman.nextLabel();
    this.exprman.add(label, expr);
    this.drawExprs();
    this.seekbar.draw();
  }
  rem(label) {
    this.exprman.rem(label);
    this.drawExprs();
  }
  drawExprs() {
    this.trace_gb.clear();
    this.exprman.expr_map.forEach((val, key, map) => {
      if(val != null) {
        this.drawExpr(val);
      }
    });
    this.seekbar.draw();
  }
  drawExpr(expr) {
    if(!expr){ return; }
    let t_gb = this.trace_gb;
    const r = this.ranges;
    const resolution = 1000;
    const step = r.projection.width / resolution;
    const dispOrigin = this.displayOrigin;
    // Y is inverted because display grows downwards
    function getPoint(x, gf) {return p.createVector(x, gf(x)*-1);}
    function checkBounds(vec,min,max){return (vec.y>max || vec.y<min);}

    let x = r.projection.min.x;
    let point;
    let scaled_point;
    let prev = getPoint(x, expr.func);
    let scaled_prev;

    t_gb.strokeWeight(this.style.weights.trace);
    t_gb.stroke(expr.clr);
    let mX = r.projection.max.x;
    for(; x < mX; x += step) {
      point = getPoint(x, expr.func);
      let deltay = p.abs(point.y - prev.y);
      let oob = checkBounds(
        point,
        r.projection.min.y,
        r.projection.max.y
      );
      scaled_point = this.projToDis(point);
      scaled_prev  = this.projToDis(prev);
      prev = point.copy();
      if(oob) {continue;}
      if(deltay > this.continuity_threshold) {
        t_gb.point(scaled_point.x,scaled_point.y);
      } else {
        t_gb.line(
          scaled_prev.x,scaled_prev.y,
          scaled_point.x,scaled_point.y
        );
      }
    }
  }
  disToProj(vec, clamp = false) {
    const dm = this.ranges.display.min;
    const dM = this.ranges.display.max;
    const pm = this.ranges.projection.min;
    const pM = this.ranges.projection.max;
    let x = vec.x;
    let y = vec.y;
    if(clamp) {
      x = p.constrain(vec.x, dm.x, dM.x);
      y = p.constrain(vec.y, dm.y, dM.y);
    }
    return p.createVector(
      p.map(x, dm.x,dM.x, pm.x,pM.x),
      p.map(y, dm.y,dM.y, pm.y,pM.y)
    );
  }
  projToDis(vec, clamp = false) {
    const dm = this.ranges.display.min;
    const dM = this.ranges.display.max;
    const pm = this.ranges.projection.min;
    const pM = this.ranges.projection.max;
    let x = vec.x;
    let y = vec.y;
    if(clamp) {
      x = p.constrain(vec.x, pm.x, pM.x);
      y = p.constrain(vec.y, pm.y, pM.y);
    }
    return p.createVector(
      p.map(x, pm.x,pM.x, dm.x,dM.x),
      p.map(y, pm.y,pM.y, dm.y,dM.y)
    );
  }
  draw() {
    this.seekbar.update();
    p.image(this.static_gb,0,0);
    p.image(this.trace_gb,0,0);
    p.image(this.marks_gb,0,0);
    this.seekbar.draw();
  }
}

class ExprMan {
  constructor() {
    this.expr_map = new Map();
    // Don't include x and y
    let allowed_labels = "abcdefghijklmnopqrstuvwz".split('');
    allowed_labels.forEach((e) => { this.expr_map.set(e, null); });
  }
  nextLabel() {
    let label = undefined;
    let keys = this.expr_map.keys();
    for(let i = 0; i < this.expr_map.size; i++) {
      let key = keys.next().value;
      let val = this.expr_map.get(key);
      if(val == null) {
        label = key;
        break;
      }
    } return label;
  }
  add(label, expr) {
    if(this.expr_map.has(label)) {
      this.expr_map.set(label, expr);
    } else {
      console.error(`ExprMan> Forbidden label "${label}"!`);
    }
  }
  rem(label) { this.expr_map.set(label, null); }
}

class Seekbar {
  constructor(graph) {
    this.graph = graph;
    this.gb = this.graph.marks_gb;
    this.x = 0;
    this.min_x = this.graph.ranges.projection.min.x;
    this.max_x = this.graph.ranges.projection.max.x;
    this.bound_loop = false;
    this.val = [];
    this.vel = 0;
    this.pallete = this.graph.pallete;
    this.style   = this.graph.style;
    this.playing = false;
  }
  setX(x) {
    let projX = this.graph.disToProj(p.createVector(x,0)).x;
    const rp = this.graph.ranges.projection;
    this.x = p.constrain(projX, rp.min.x, rp.max.x);
  }
  setVel(v) {
    if(v >= 0) {
      this.vel = v;
    }
  }
  update() {
    if(this.playing) {
      this.x += this.vel;
      if(this.bound_loop && this.x > this.max_x) {
        this.x = this.min_x;
      }
    }
  }
  draw() {
    const ranges = this.graph.ranges;
    const disp = ranges.display;
    const proj = ranges.projection;

    let coord = this.graph.projToDis(p.createVector(this.x,0));
    this.gb.push();
    this.gb.clear();
    this.gb.colorMode(p.RGB);
    this.gb.stroke(this.pallete.mark);
    this.gb.strokeWeight(this.style.weights.mark);
    this.gb.line(coord.x, disp.min.y, coord.x, disp.max.y);

    this.gb.noStroke();
    this.gb.fill(this.pallete.accent_mark);
    this.graph.exprman.expr_map.forEach((val, key) => {
      if(val !== null) {
        let y = val.func(this.x);
        coord = this.graph.projToDis(p.createVector(this.x, y*-1));
        this.gb.circle(coord.x,coord.y, this.style.mark_size);
      }
    });
  }
}

