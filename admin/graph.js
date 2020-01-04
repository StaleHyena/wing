export class Graph {
  constructor(w,h, space, config) {
    this.static_gb = p.createGraphics(w,h);
    this.trace_gb  = p.createGraphics(w,h);
    this.marks_gb  = p.createGraphics(w,h);
    this.width = w;
    this.height = h;
    /*this.scale_factor = p.createVector(
      r.display.width /r.projection.width,
      r.display.height/r.projection.height
    );*/
    this.selectedX = 0;
    this.pallete = config.pallete;
    this.style = config.style;

    this.exprman = new ExprMan();
    this.seekbar = new Seekbar(this);
    this.space   = space;
    this.display_space = new GraphSpace();
    this.display_space.setMin({'x':0,'y':0});
    this.display_space.setMax({'x':w,'y':h});
    this.updateGrid();

    //this.seekbar.bound_loop = true;
  }
  updateGrid() {
    let s_gb = this.static_gb;
    const space = this.space;
    const unit = space.unit;
    s_gb.background(this.pallete.bg);

    const dispOrigin = this.spaceToDis({'x':0,'y':0});
    // axis
    {
      s_gb.strokeWeight(this.style.weights.axis);
      s_gb.stroke(this.pallete.axis);
      if(dispOrigin.x > 0 && dispOrigin.x < this.width) {
        s_gb.line(
          dispOrigin.x,0,
          dispOrigin.x,this.height
        );
      }
      if(dispOrigin.y > 0 && dispOrigin.y < this.height) {
        s_gb.line(
          0,dispOrigin.y,
          this.width,dispOrigin.y
        );
      }
    }

    let vert = [];

    // Populate vertices
    let x, y, c, off;
    x = p.max(0, space.min.x);
    y = p.max(0, space.min.y);
    // Keep aligned with origin
    off = { 'x': x % unit.x, 'y': y % unit.y };
    do {
      x += unit.x;
      y += unit.y;
      vert.push({
          'x': x - off.x,
          'y': y - off.y
      });
      c = (x < space.max.x) || (y < space.max.y);
      //c = c && vert.length < 2048; // cap size
    } while(c);

    x = p.min(0, space.max.x);
    y = p.min(0, space.max.y);
    // Keep aligned with origin
    off = { 'x': x % unit.x, 'y': y % unit.y };
    do {
      x -= unit.x;
      y -= unit.y;
      vert.push({
          'x': x - off.x,
          'y': y - off.y
      });
      c = (x > space.min.x) || (y > space.min.y);
      //c = c && vert.length < 2048; // cap size
    } while(c);

    // Convert to screen coords
    vert.forEach((elt, i, arr) => {
      arr[i] = this.spaceToDis({'x': elt.x, 'y': elt.y}, true);
    });

    // Draw to screen
    s_gb.strokeWeight(this.style.weights.grid);
    s_gb.stroke(this.pallete.grid);

    vert.forEach((elt, i, arr) => {
      s_gb.line(elt.x,0, elt.x,this.height);
      s_gb.line(0,elt.y, this.width,elt.y);
    });
  }
  add(expr) {
    let label = this.exprman.nextLabel();
    this.exprman.add(label, expr);
    this.drawExprs();
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
  }
  drawExpr(expr) {
    if(!expr){ return; }
    let t_gb = this.trace_gb;
    const space = this.space;
    const resolution = 1000;
    const step = space.width / resolution;
    // Y is inverted because display Y coords grow downwards
    function getPoint(x, gf) { return { 'x': x, 'y': gf(x)*-1 }; }
    function checkBounds(v){ return v.y > space.max.y || v.y < space.min.y; }
    function clamp(num, min, max) {
      return Math.min(Math.max(num, min), max);
    }

    let x = space.min.x;
    let point;
    let scaled_point;
    let prev = getPoint(x, expr.func);
    let scaled_prev;

    t_gb.strokeWeight(this.style.weights.trace);
    t_gb.stroke(expr.clr);
    for(; x < space.max.x; x += step) {
      point = getPoint(x, expr.func);

      scaled_point = this.spaceToDis(point);
      // Don't lose continuity when oob
      if(checkBounds(point)) {
        if(!checkBounds(prev)) {
          // Optimal solution calcs the x for intersection,
          // Clamping to size is close enough
          // FIXME if you care
          scaled_point = this.spaceToDis(point, true);

        } else {
          prev = { ...point };
          continue;
        }
      }
      
      scaled_prev  = this.spaceToDis(prev);
      prev = { ...point };

      t_gb.line(
        scaled_prev.x,scaled_prev.y,
        scaled_point.x,scaled_point.y
      );
    }
  }
  disToSpace(v, clamp = false) {
    return this.display_space.map(v, this.space, clamp);
  }
  spaceToDis(v, clamp = false) {
    return this.space.map(v, this.display_space, clamp);
  }
  draw(x,y) {
    this.seekbar.draw(this.marks_gb, this.space, this.exprman);
    p.image(this.static_gb, x,y);
    p.image(this.trace_gb,  x,y);
    p.image(this.marks_gb,  x,y);
  }
  update() {
    this.seekbar.update();
  }
}

export class ExprMan {
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

export class Seekbar {
  constructor() {
    this.x = 0;
    this.bound_loop = false;
    this.bounds = { 'min': -1, 'max': 1 }
    this.vel = 0;
    this.playing = false;
  }
  setX(x) {
    if(this.playing) {return;}
    this.x = x;
  }
  setVel(v) { this.vel = v; }
  setBounds(b) {
    if(b.min == b.max) {return;}
    this.bounds = b;
  }
  getVals(exprman) {
    let acc = [];
    exprman.expr_map.forEach((val) => {
      if(val !== null) {
        acc.push(val.func(this.x));
      }});
    return acc;
  }
  update() {
    if(this.playing) {
      this.x += this.vel;
      if(this.bound_loop && this.x > this.bounds.max) {
        this.x = this.bounds.min;
      }
    }
  }
  draw(gb, space, exprman) {
    let display_space = new GraphSpace();
    display_space.setMin({'x':0,'y':0});
    display_space.setMax({'x':gb.width,'y':gb.height});
    let spaceToDis = function(x,y, clamp = false) {
      return space.map({'x':x,'y':y},display_space,clamp);
    }

    let coord = spaceToDis(this.x, 0);
    gb.push();
    gb.clear();
    gb.colorMode(p.RGB);
    //FIXME: magic nums
    gb.stroke("#ffffff60");
    //gb.strokeWeight(this.style.weights.mark);
    gb.strokeWeight(1.5);
    gb.line(coord.x, 0, coord.x, gb.height);

    gb.noStroke();
    exprman.expr_map.forEach((expr) => {
      if(expr == null) return;
      let y = expr.func(this.x) * -1; // Inverted so it maps to screen coords
      coord = spaceToDis(this.x,y);
      gb.fill(expr.clr);
      //gb.circle(coord.x,coord.y, this.style.mark_size);
      gb.circle(coord.x,coord.y, 10);
    });
  }
}

export class GraphSpace {
  constructor() {
    this.min = {'x':-1,'y':-1};
    this.max = {'x':1,'y':1};
    this.unit = {'x':1,'y':1};
    this.width;
    this.height;
    this.recalc();
  }
  setMin(v) { this.min.x = v.x; this.min.y = v.y; this.recalc(); }
  setMax(v) { this.max.x = v.x; this.max.y = v.y; this.recalc(); }
  recalc() {
    this.width  = this.max.x - this.min.x;
    this.height = this.max.y - this.min.y;
  }
  map(vec, other, clamp = false) {
    const s = this.min;
    const S = this.max;
    const o = other.min;
    const O = other.max;
    let x = vec.x;
    let y = vec.y;
    if(clamp) {
      if(x < s.x){ x = s.x; }; if(x > S.x){ x = S.x };
      if(y < s.y){ y = s.y; }; if(y > S.y){ y = S.y };
    }
    return {
      'x': p.map(x, s.x,S.x, o.x,O.x),
      'y': p.map(y, s.y,S.y, o.y,O.y)
    };
  }
  pan() {

  }
  zoom() {

  }
  center() {

  }
  ogZoom() {

  }
  reset() {

  }
}

