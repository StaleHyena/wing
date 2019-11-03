export default class Graph {
  constructor(w,h) {
    this.static_gb = p.createGraphics(w,h);
    this.trace_gb  = p.createGraphics(w,h);
    this.marks_gb  = p.createGraphics(w,h);
    this.origin = p.createVector();
    this.scale_factor = p.createVector();
    this.cur_graph_func = undefined;
    this.continuity_threshold = 100;

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
      //'padding': 16,
      'padding': 12,
      'text': {
        'size': 32,
        'spacing': 40,
      },
      'mark_size': 10,
    }

    this.updateRanges([p.PI,1, 0,2*p.PI, -2,2]);
    this.updateGrid();
  }

  updateGrid() {
    let s_gb = this.static_gb;
    s_gb.background(this.pallete.bg);
    let grid_c = this.pallete.grid;
    let axis_c = this.pallete.axis;
    let grid_w = this.style.weights.grid;
    let axis_w = this.style.weights.axis;

    let unit = this.ranges.unit;
    let dis  = this.ranges.display;
    let proj = this.ranges.projection;
    let orig = this.origin;
    let w = dis.width;
    let h = dis.height;
    //console.log('step = ' + step.toString());
    let sfactor = this.scale_factor;

    // Draw y axis
    s_gb.push();
    s_gb.translate(orig.x,0);
    s_gb.strokeWeight(axis_w);
    s_gb.stroke(axis_c);
    s_gb.line(
      0,dis.min.y,
      0,dis.max.y
    );
    s_gb.strokeWeight(grid_w);
    s_gb.stroke(grid_c);
    for(let i = 1; i <= (((proj.width)/unit.x)/2)+1; i++) {
      let offx = i * unit.x * sfactor.x;
      // One for each side
      s_gb.line(
        offx,dis.min.y,
        offx,dis.max.y
      );
      s_gb.line(
        -offx,dis.min.y,
        -offx,dis.max.y
      );
    }
    s_gb.pop();
    // And x axis
    s_gb.push();
    s_gb.translate(0,orig.y);
    s_gb.strokeWeight(axis_w);
    s_gb.stroke(axis_c);
    s_gb.line(
      dis.min.x,0,
      dis.max.x,0
    );
    s_gb.strokeWeight(grid_w);
    s_gb.stroke(grid_c);
    for(let i = 1; i <= (((-proj.height)/unit.y)/2)+1; i++) {
      let offy = i * unit.y * sfactor.y;
      s_gb.line(
        dis.min.x,offy,
        dis.max.x,offy
      );
      s_gb.line(
        dis.min.x,-offy,
        dis.max.x,-offy
      );
    }
    s_gb.pop();
  }

  updateRanges(vals) {
    let unit = this.ranges.unit;
    let proj = this.ranges.projection;
    let dis = this.ranges.display;
    let pad = this.style.padding;
    let s_gb = this.static_gb;
    let orig = this.origin;
    let w = s_gb.width;
    let h = s_gb.height;

    unit.x = vals[0];
    unit.y = vals[1];
    //console.log('unit = '+unit.toString());

    proj.min.x  = vals[2];
    proj.max.x  = vals[3];
    proj.min.y  = vals[5];
    proj.max.y  = vals[4];
    proj.width  = proj.max.x - proj.min.x;
    proj.height = proj.max.y - proj.min.y;

    dis.min.x = pad;
    dis.max.x = w - pad;
    dis.min.y = pad;
    dis.max.y = h - pad;
    dis.width  = dis.max.x - dis.min.x;
    dis.height = dis.max.y - dis.min.y;

    // Get origin from projection
    orig.x = p.map(0, proj.min.x,proj.max.x, dis.min.x,dis.max.x);
    orig.y = p.map(0, proj.min.y,proj.max.y, dis.min.y,dis.max.y);

    this.scale_factor.x = dis.width/proj.width;
    this.scale_factor.y = dis.height/proj.height;
  }

  drawGraph(graph_func) {
    let t_gb = this.trace_gb;
    let proj = this.ranges.projection;
    let dis = this.ranges.display;
    let unit = this.ranges.unit;
    let w = dis.width;
    let h = dis.height;
    let orig = this.origin;
    this.cur_graph_func = graph_func;

    let resolution = 1000;
    let step = proj.width / resolution;

    let trace_c = this.pallete.trace;
    let trace_w = this.style.weights.trace;

    let prev = p.createVector(0,0);

    let sfactor = this.scale_factor;

    // DRY this somehow
    t_gb.push();
    t_gb.clear();
    t_gb.translate(orig.x, orig.y);
    t_gb.strokeWeight(trace_w);
    t_gb.stroke(trace_c);
    let x = proj.min.x;
    let sx = x * sfactor.x;
    let porig = this.disToProj(orig.x, 0)[0];
    let inx = x - porig;
    let y = graph_func(inx) * sfactor.y;
    prev.x = sx;
    prev.y = y;
    console.log(`called, ${x}, ${sx}, ${porig}, ${inx}, ${y}`);
    for(; x < proj.max.x; x+=step) {
      sx = x * sfactor.x;
      porig = this.disToProj(orig.x, 0)[0];
      inx = x - porig;
      y = graph_func(inx) * sfactor.y;
      let deltay = p.abs(y - prev.y);
      if(deltay > this.continuity_threshold) {
        t_gb.point(sx,y);
      } else {
        t_gb.line(prev.x,prev.y, sx,y);
      }
      prev.x = sx;
      prev.y = y;
    }
    t_gb.pop();
  }

  drawSelection(x_sel) {
    let dis = this.ranges.display;
    let graph_func = this.cur_graph_func;
    if(x_sel > dis.max.x || x_sel < dis.min.x || !graph_func) return;
    let m_gb = this.marks_gb;
    let proj = this.ranges.projection;
    let orig = this.origin;
    let sfactor = this.scale_factor;
    let px = (x_sel - orig.x) / sfactor.x;
    let py = graph_func(px);
    let accentm_y = py*sfactor.y;

    let m_c = this.pallete.mark;
    let am_c = this.pallete.accent_mark;
    let m_w = this.style.weights.mark;
    let size = this.style.mark_size;

    let txt_s = this.style.text.size;
    let txt_sp = this.style.text.spacing;
    let txt_c = this.pallete.text;

    m_gb.clear();
    m_gb.push();
    m_gb.stroke(m_c);
    m_gb.strokeWeight(m_w);
    m_gb.line(x_sel,dis.min.y, x_sel,dis.max.y);
    m_gb.translate(0,orig.y); // -
    m_gb.noStroke();
    m_gb.fill(am_c);
    m_gb.circle(x_sel, accentm_y, size);
    // txt
    m_gb.translate(x_sel + txt_sp, accentm_y-txt_sp);
    m_gb.textSize(txt_s);
    m_gb.textAlign(p.CENTER);
    m_gb.fill(txt_c);
    let roundx = p.round(px*1000)/1000;
    let roundy = p.round(py*1000)/1000;
    m_gb.text('('+roundx+','+roundy+')',0,0);
    m_gb.pop();
  }

  disToProj(ix,iy) {
    let dis = this.ranges.display;
    let proj = this.ranges.projection;
    let x = p.constrain(ix, dis.min.x, dis.max.x);
    let y = p.constrain(iy, dis.min.y, dis.max.y);
    return [
      p.map(x, dis.min.x,dis.max.x, proj.min.x,proj.max.x),
      p.map(y, dis.min.y,dis.max.y, proj.min.y,proj.max.y)
    ];
  }

  projToDis(ix,iy) {
    let dis = this.ranges.display;
    let proj = this.ranges.projection;
    let x = p.constrain(ix, proj.min.x, proj.max.x);
    let y = p.constrain(iy, proj.min.y, proj.max.y);
    return [
      p.map(x, proj.min.x,proj.max.x, dis.min.x,dis.max.x),
      p.map(y, proj.min.y,proj.max.y, dis.min.y,dis.max.y)
    ];
  }
}

