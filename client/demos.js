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
  /*
  {
    'name':'ciclo',
    'f':(vals,gb) => {
      gb.stroke(
    }
    */
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

