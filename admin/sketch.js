let demowin_gb;
let canvas;

function setup() {
  let div = select('#p5canvas-holder');
  let ds = div.size();
  canvas = createCanvas(ds.width, ds.height);
  canvas.parent(div);
  canvas.mousePressed(onMousePressed);
  canvas.mouseReleased(onMouseReleased);

  graph_d = new Graph(width,height);
  num_clients = 0;

  mousePressed = false;
  mouseGracePeriod = 0;

  demowin_gb = createGraphics(width, height);

  graph_d.updateRanges([PI/2,1, -PI,5*PI, -1.2,1.2]);
  graph_d.updateGrid();
  
  scrubbing = false;
  scrub_pos = graph_d.ranges.display.min.x;
  step_max = width/40;

  setupUI();
  setupNet(() => {
    newGraphIn();
    newDemoIn();
    newStepIn();
  });
}

function draw() {
  if(!cur_graph) { return; }
  if(mouseIsPressed && mouseButton == RIGHT) {
    graph_d.drawGraph(cur_graph.f);
  }
  
  let selx = getX();
  // x can come from mouse, from scrubber or not come at all
  if(selx) {
    graph_d.drawSelection(getX());
    packetData = graph_d.disToProj(getX(),0);
    packetData[1] = cur_graph.f(packetData[0]);
    emitData('vals', packetData);
  }

  if(scrubbing) {
    scrub_pos += scrub_step;
    if(scrub_pos > graph_d.ranges.display.max.x) {
      scrub_pos = graph_d.ranges.display.min.x;
    }
  }
  else if(mouseGracePeriod > 0) {
    mouseGracePeriod -= 1;
  }
  image(graph_d.static_gb,0,0);
  image(graph_d.trace_gb,0,0);
  image(graph_d.marks_gb,0,0);
}

function setupNet(callback = undefined) {
  socket = io();
  netError = false;
  socket.on('connect', () => {
    socket.on('clients', (c) => {
      num_clients = c - 1;
      updateClientCount(num_clients);
    });
    socket.on('disconnect', (reason) => {
      console.error('Disconnected from server -- ' + reason);
    });
    emitData('admin');
    if(callback){
      callback();
    }
  });
}

function getX() {
  if(scrubbing) {
    return scrub_pos;
  } else if (mousePressed) {
    return mouseX;
  }
  return undefined;
}

function onMousePressed() {
  let t = mouseGracePeriod == 0 && mouseIsPressed;
  if(mouseGracePeriod == 0 && mouseIsPressed) {
    mousePressed = true;
  } else {
    mousePressed = false;
  }
}

function onMouseReleased() {
  mousePressed = false;
}



