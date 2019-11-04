export default class Graph {
  constructor(w,h) {
    this.static_gb = p.createGraphics(w,h);
    this.trace_gb  = p.createGraphics(w,h);
    this.marks_gb  = p.createGraphics(w,h);
    this.origin = p.createVector();
    this.displayOrigin = p.createVector();
    this.scale_factor = p.createVector();
    this.graph_f = (x) => { return 0; };
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

    this.updateRanges([1,1, -1,1, -1,1]);
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
      s_gb.line(
        dispOrigin.x,r.display.min.y,
        dispOrigin.x,r.display.max.y
      );
      s_gb.line(
        r.display.min.x,dispOrigin.y,
        r.display.max.x,dispOrigin.y
      );
    }

    s_gb.strokeWeight(this.style.weights.grid);
    s_gb.stroke(this.pallete.grid);

    // columns
    s_gb.push();
    s_gb.translate(dispOrigin.x, 0);
    let mX = (r.projection.width)/r.unit.x;
    for(let i = 1; i <= mX; i++) {
      let offx = i * r.unit.x * this.scale_factor.x;
      s_gb.line(
        offx,r.display.min.y,
        offx,r.display.max.y
      );
      s_gb.line(
        -offx,r.display.min.y,
        -offx,r.display.max.y
      );
    }
    s_gb.pop();

    // rows
    s_gb.push();
    s_gb.translate(0, dispOrigin.y);
    let mY = (-r.projection.height)/r.unit.y;
    for(let i = 1; i <= mY; i++) {
      let offy = i * r.unit.y * this.scale_factor.y;
      s_gb.line(
        r.display.min.x,offy,
        r.display.max.x,offy
      );
      s_gb.line(
        r.display.min.x,-offy,
        r.display.max.x,-offy
      );
    }
    s_gb.pop();
  }

  updateRanges(vals) {
    let s_gb = this.static_gb;
    let orig = this.origin;
    let w = s_gb.width;
    let h = s_gb.height;
    let r = this.ranges;

    r.unit.x = vals[0];
    r.unit.y = vals[1];
    //console.log('unit = '+unit.toString());

    {
      let rp = r.projection;
      rp.min.x  = vals[2];
      rp.max.x  = vals[3];
      rp.min.y  = vals[5];
      rp.max.y  = vals[4];
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

    console.log(r);
    this.origin = p.createVector(0,0);
    console.log(`origin ${this.origin}`);
    this.displayOrigin = this.projToDis(this.origin);
    console.log(`displayOrigin ${this.displayOrigin}`);

    this.scale_factor = p.createVector(
      r.display.width /r.projection.width,
      r.display.height/r.projection.height
    );
  }

  bindFunc(graph_function) {
    this.graph_f = graph_function;
    this.drawGraph();
    this.drawSelection();
  }

  selectDisp(x) {
    this.selectedX = this.disToProj(p.createVector(x,0)).x;
    this.drawSelection();
  }

  getSelection() {
    return p.createVector(this.selectedX, this.graph_f(this.selectedX));
  }

  drawGraph() {
    if(!this.graph_f){ return; }
    let t_gb = this.trace_gb;
    const r = this.ranges;
    const resolution = 1000;
    const step = r.projection.width / resolution;
    const dispOrigin = this.displayOrigin;
    function getPoint(x, gf) {return p.createVector(x, gf(x));}
    function checkBounds(vec,min,max){return (vec.y>max || vec.y<min);}

    let x = r.projection.min.x;
    let point;
    let scaled_point;
    let prev = getPoint(x, this.graph_f);
    let scaled_prev;

    t_gb.clear();
    t_gb.strokeWeight(this.style.weights.trace);
    t_gb.stroke(this.pallete.trace);
    let mX = r.projection.max.x;
    for(; x < mX; x += step) {
      point = getPoint(x, this.graph_f);
      let deltay = p.abs(point.y - prev.y);
      let oob = checkBounds(
        point,
        this.ranges.projection.max.y,
        this.ranges.projection.min.y
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
    const invalid = 
      selx == undefined || !this.graph_f ||
      selx > r.projection.max.x || selx < r.projection.min.x;
    if(invalid){
      console.log('invalid selection');
      return;
    }
    const dispOrigin = this.displayOrigin;

    let m_gb = this.marks_gb;
    let point = this.projToDis(p.createVector(selx, this.graph_f(selx)));

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
    let roundy = p.round(this.graph_f(selx)*1000)/1000;
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
      p.map(y, dm.y,dM.y, pm.y,pM.y) // haven't tested if it needs inversion
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
      y = p.constrain(vec.y, pM.y, pm.y); // inverted, ranges are backwards
    }
    return p.createVector(
      p.map(x, pm.x,pM.x, dm.x,dM.x),
      p.map(y, pm.y,pM.y, dm.y,dM.y)
    );
  }
}

