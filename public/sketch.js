let socket;
let vals;
let demo;
let demo_gb;

function setup() {
  createCanvas(windowWidth, windowHeight);
  demo_gb = createGraphics(width, height);
  demo = demos[0];
  vals = [0,0]
  setupNet();
}

function draw() {
  let f = demo.f;
  f(vals, demo_gb);
  image(demo_gb, 0,0);
}

function setupNet() {
  socket = io();
  socket.on('vals', (v) => {
    vals = v;
  });
  socket.on('demo', (d) => {
    demo = demoFromName(d);
    console.log(demo);
  });
}

