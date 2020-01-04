let demos = [
  { 'name':'greys',
    'f':(p, vals) => {
      p.colorMode(p.RGB);
      p.fill(vals[1]*255);
      p.noStroke();
      p.rect(0,0, p.width,p.height);
    }
  },
  { 'name':'colours',
    'f':(p, vals) => {
      p.colorMode(p.HSB, 360);
      p.noStroke();
      let v = vals[1]*180;
      if(v < 0) { v = 360+v; }
      p.fill(v, 360, 200);
      p.rect(0,0, p.width, p.height);
    }
  },
  { 'name':'ciclo',
    'f':(p, vals) => {
      let r = (p.min(p.width,p.height)/2) * 0.8;
      let c = p.createVector(p.width/2, p.height/2);

      p.colorMode(p.RGB);
      p.background(50);
      p.noFill();

      p.strokeWeight(0.8);
      p.stroke(255,255,102);
      p.line(0,c.y, p.width,c.y);
      p.line(c.x,0, c.x,p.height);

      p.strokeWeight(3);
      p.stroke(240);
      p.circle(c.x, c.y, r*2);

      let ep = p.createVector(0,0); // endpoint
      // hyp
      ep.x = c.x + r * p.cos(vals[0]);
      ep.y = c.y - r * p.sin(vals[0]);
      p.line(c.x, c.y, ep.x, ep.y);
      // sin
      p.stroke(80,255,80);
      p.line(ep.x,ep.y, ep.x, c.y);
      p.line(c.x,ep.y, c.x,c.y);
      // cos
      p.stroke(80,80,255);
      p.line(ep.x,ep.y, c.x, ep.y);
      p.line(ep.x,c.y, c.x,c.y);
      // tan
      let tep = p.createVector(0,0);
      tep.x = c.x + r/p.cos(vals[0]);
      tep.y = c.y
      p.stroke(255,80,80);
      p.line(ep.x,ep.y, tep.x,tep.y);

      let x_sign = (p.cos(vals[0])>=0)? 1 : -1;
      let y_sign = 1;
      let tsp_x = c.x + x_sign*r;
      tep.x = tsp_x;
      tep.y = c.y - x_sign*r*p.tan(vals[0]);
      p.line(tsp_x,c.y, tep.x,tep.y);
    }
  },
  { 'name' : 'ball',
    'f': (p, vals) => {
      p.colorMode(p.RGB);
      p.fill(253,102,0);
      p.noStroke();
      let d = p.min(p.height,p.width) * 0.9;
      p.background(0,120,255);
      p.circle(p.width/2, p.height/2, d*vals[1]);
    }
  },
  { 'name': 'ball inv',
    'f': (p, vals) => {
      p.colorMode(p.RGB);
      p.background(0);
      p.noStroke();
      let d = p.min(p.height,p.width)* 0.9;
      let y = vals[1];
      if(y>0) {
        p.fill(253,102,0);
      } else {
        p.fill(2,153,255);
      }
      p.circle(p.width/2, p.height/2, d*y);
    },
  },
  { 'name': 'leg',
    'setup': (p, ram) => {
      ram.offbuf = p.createCanvas(p.width, p.height);
    },
    'f': (p, vals, ram) => {
      let v = [];
      let r = 30;
      let a = vals[0];
      v[0] = p.createVector(p.width/2, p.height/2);
      v[1] = p.createVector(v[0].x + p.cos(a)*r, v[0].y + p.sin(a)*r);

      let clr = p.color(0, 12);
      p.noStroke();
      p.fill(clr);
      p.rect(0,0, p.width, p.height);
      p.stroke("#ffffff");
      p.strokeWeight(3);
      p.line(v[0].x, v[0].y, v[1].x, v[1].y);
      p.stroke("#ff2222");
      p.strokeWeight(8);
      p.point(v[1].x, v[1].y);
    },
  },
];

function demoFromName(name) {
  let arr = demos;
  for(let i=0; i<arr.length; i++) {
    if(arr[i].name == name) {
      return arr[i];
    }
  }
  return null;
}

export { demos, demoFromName };

