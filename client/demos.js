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

      gb.background(24);
      gb.noFill();

      gb.strokeWeight(0.8);
      gb.stroke(255,255,102);
      gb.line(0,c.y, width,c.y);
      gb.line(c.x,0, c.x,height);

      gb.strokeWeight(3);
      gb.stroke(240);
      gb.circle(c.x, c.y, r*2);
      let ep = createVector(); // endpoint
      ep.x = c.x + r * cos(vals[0]);
      ep.y = c.y - r * sin(vals[0]);
      gb.line(c.x, c.y, ep.x, ep.y);
      
      gb.stroke(80,255,80);
      gb.line(ep.x,ep.y, ep.x, c.y);

      gb.stroke(80,80,255);
      gb.line(ep.x,ep.y, c.x, ep.y);
    }
  },
  {
    'name' : 'ball',
    'f' :(vals, gb) => {
      gb.colorMode(RGB);
      gb.fill(253,102,0);
      gb.noStroke();
      let r = 700
      gb.background(0,120,255)
      gb.circle(width/2, height/2, r*vals[1])
    }
  }
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

