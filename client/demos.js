let demos = [
  {
    'name':'greys',
    'f':(vals, gb) => {
      gb.colorMode(RGB);
      gb.fill(vals[1]*255);
      gb.noStroke();
      gb.rect(0,0, width,height);
    }
  },
  {
    'name':'colours',
    'f':(vals, gb) => {
      gb.colorMode(HSB, 360);
      gb.noStroke();
      let v = vals[1]*180;
      if(v < 0) { v = 360+v; }
      gb.fill(v, 360, 200);
      gb.rect(0,0, width, height);
    }
  },
  {
    'name':'ciclo',
    'f':(vals,gb) => {
      let r = (min(width,height)/2) * 0.8;
      let c = createVector(width/2, height/2);

      gb.colorMode(RGB);
      gb.background(50);
      gb.noFill();

      gb.strokeWeight(0.8);
      gb.stroke(255,255,102);
      gb.line(0,c.y, width,c.y);
      gb.line(c.x,0, c.x,height);

      gb.strokeWeight(3);
      gb.stroke(240);
      gb.circle(c.x, c.y, r*2);

      let ep = createVector(0,0); // endpoint
      // hyp
      ep.x = c.x + r * cos(vals[0]);
      ep.y = c.y - r * sin(vals[0]);
      gb.line(c.x, c.y, ep.x, ep.y);
      // sin
      gb.stroke(80,255,80);
      gb.line(ep.x,ep.y, ep.x, c.y);
      gb.line(c.x,ep.y, c.x,c.y);
      // cos
      gb.stroke(80,80,255);
      gb.line(ep.x,ep.y, c.x, ep.y);
      gb.line(ep.x,c.y, c.x,c.y);
      // tan
      let tep = createVector(0,0);
      tep.x = c.x + r/cos(vals[0]);
      tep.y = c.y
      gb.stroke(255,80,80);
      gb.line(ep.x,ep.y, tep.x,tep.y);

      //let a = (vals[0] > 0)? vals[0] % TAU : (TAU - vals[0]) % TAU;
      let x_sign = (cos(vals[0])>=0)? 1 : -1;
      let y_sign = 1;
      let tsp_x = c.x + x_sign*r;
      tep.x = tsp_x;
      tep.y = c.y - x_sign*r*tan(vals[0]);
      gb.line(tsp_x,c.y, tep.x,tep.y);
    }
  },
  {
    'name' : 'ball',
    'f': (vals, gb) => {
      gb.colorMode(RGB);
      gb.fill(253,102,0);
      gb.noStroke();
      let d = min(height,width) * 0.9;
      gb.background(0,120,255);
      gb.circle(width/2, height/2, d*vals[1]);
    }
  },
  {
    'name': 'ball inv',
    'f': (vals, gb) => {
      gb.colorMode(RGB);
      gb.background(0);
      gb.noStroke();
      let d = min(height,width)* 0.9;
      let y = vals[1];
      if(y>0) {
        gb.fill(253,102,0);
      } else {
        gb.fill(2,153,255);
      }
      gb.circle(width/2, height/2, d*y);
    },
  },
];
module.exports.demos = demos;

function demoFromName(name) {
  let arr = demos;
  for(let i=0; i<arr.length; i++) {
    if(arr[i].name == name) {
      return arr[i];
    }
  }
  return null;
}

