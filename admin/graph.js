export default class Graph {
  constructor(w,h) {
    this.static_gb = p.createGraphics(w,h);
    this.trace_gb  = p.createGraphics(w,h);
    this.marks_gb  = p.createGraphics(w,h);
    this.origin = p.createVector();
    this.displayOrigin = p.createVector();
    this.scale_factor = p.createVector();
    this.selectedX = 0;
    this.continuity_threshold = 10000;

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
    this.pallete = {
      'bg': p.color(42),
      'grid': p.color(166),
      'trace': p.color(33, 107, 181),
      'mark': p.color(255, 69),
      'accent_mark': p.color(230, 75, 75),
      'axis': p.color(39, 112, 54),
      'text': p.color(200),
    }
    this.style = {
      'weights': {
        'grid': 0.5,
        'axis':3.5,
        'trace':4,
        'mark':3,
      },
      'padding': 64,
      //'padding': 12,
      'text': {
        'size': 32,
        'spacing': 40,
      },
      'mark_size': 10,
    }
    
    this.graphs = [];

    this.updateRanges({
      unit: { x:1,y:1 },
      min:  { x:1,y:1 },
      max:  { x:1,y:1 },
    });
    this.updateGrid();
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

  addGraph(graph) {
    /*
    let id;
    const len = this.graphs.length;
    if(len > 0) {
      let tally = [];
      this.graphs.forEach((g) => {
        tally.push(g.id);
      });
      tally.sort();
      for(let i = 0; i < tally.length; i++) {

      }
    } else {
      id = 0;
    }
    graph.id = id + 1;
    */
    this.graphs.push(graph);
    this.drawGraphs();
    this.drawSelection();
  }

  getGraphById(id) {
    for(let i = 0; i < this.graphs.length; i++) {
      let g = this.graphs[i];
      if(g.id == id) {
        return g;
      }
    }
    return undefined;
  }

  remGraph(id) {
    for(let i = 0; i < this.graphs.length; i++) {
      let g = this.graphs[i];
      if(g.id == id) {
        this.graphs.splice(i, 1);
        drawGraphs();
      }
    }
  }

  selectDisp(x) {
    this.selectedX = this.disToProj(p.createVector(x,0)).x;
    this.drawSelection();
  }

  getSelection() {
    const g = this.getGraphById(0);
    if(g) {
      return p.createVector(this.selectedX, g.func(this.selectedX));
    } else {
      return 0;
    }
  }

  drawGraphs() {
    this.trace_gb.clear();
    this.graphs.forEach((g) => {this.drawGraph(g);});
    this.drawSelection();
  }

  drawGraph(graph) {
    if(!graph){ return; }
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
    let prev = getPoint(x, graph.func);
    let scaled_prev;

    t_gb.strokeWeight(this.style.weights.trace);
    t_gb.stroke(graph.color);
    let mX = r.projection.max.x;
    for(; x < mX; x += step) {
      point = getPoint(x, graph.func);
      let deltay = p.abs(point.y - prev.y);
      let oob = checkBounds(
        point,
        this.ranges.projection.min.y,
        this.ranges.projection.max.y
      );
      scaled_point = this.projToDis(point);
      scaled_prev = this.projToDis(prev);
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

  drawSelection() {
    const r = this.ranges;
    const selx = this.selectedX;
    const g = this.getGraphById(0);
    const invalid = 
      selx == undefined || !g ||
      selx > r.projection.max.x || selx < r.projection.min.x;
    if(invalid){
      console.log('invalid selection');
      return;
    }
    const graph_f = g.func;
    const dispOrigin = this.displayOrigin;

    let m_gb = this.marks_gb;
    let point = this.projToDis(p.createVector(selx, graph_f(selx)*-1));

    m_gb.push();
    m_gb.clear();
    m_gb.stroke(this.pallete.mark);
    m_gb.strokeWeight(this.style.weights.mark);
    m_gb.line(
      point.x, r.display.min.y,
      point.x, r.display.max.y
    );
    m_gb.noStroke();
    m_gb.fill(this.pallete.accent_mark);
    m_gb.circle(point.x, point.y, this.style.mark_size);
    // txt
    const tspace = this.style.text.spacing;
    m_gb.translate(point.x + tspace, point.y - tspace);
    m_gb.textSize(this.style.text.size);
    m_gb.textAlign(p.CENTER);
    m_gb.fill(this.pallete.text);
    let roundx = p.round(selx*1000)/1000;
    let roundy = p.round(graph_f(selx)*1000)/1000;
    m_gb.text('('+roundx+','+roundy+')',0,0);
    m_gb.pop();
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
}

