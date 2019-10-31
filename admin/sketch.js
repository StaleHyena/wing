let demowin_gb;
let main_graph;
let socket;
let net_error;
let canvas;

let screen_ratio;
let cur_graph;
let cur_demo;
let num_clients;

let packet_data;
let playing;
let getrektscrub;
let getrektscrub_step;

// I'm salty about them changing this
let mousePressed;
let mouseGracePeriod;

let pallete;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight - windowHeight*UI_height);
  canvas.mousePressed(onMousePressed);
  canvas.mouseReleased(onMouseReleased);
  screen_ratio = windowWidth/windowHeight;

  main_graph = new Graph(width,height);
  //new Graph(120, 100);
  num_clients = 0;

  pallete = {
    'accent': color(224, 29, 88),
    'bg': color(240, 229, 223),
    'text': color(8, 15, 38),
  }
  
  mousePressed = false;
  mouseGracePeriod = 0;

  demowin_gb = createGraphics(width, height);

  main_graph.updateRanges([PI/2,1, -PI,5*PI, -1.2,1.2]);
  main_graph.updateGrid();
  
  playing = false;
  getrektscrub = main_graph.ranges.display.min.x;

  setupUI(
    (graph) => {
      cur_graph = graph;
      main_graph.drawGraph(graph.f);
    },
    (demo) => {
      emitData('demo', demo.name);
    },
    (step) => {
      getrektscrub_step = step;
    }, Playpause
  );

  // FIXME: UI system is awful, small fix for now
  setupNet(() => {
    newGraphSelected();
    newDemoSelected();
    newStepSelected();
  });
}

function draw() {
  if(!cur_graph) { return; }
  if(mouseIsPressed && mouseButton == RIGHT) {
    main_graph.drawGraph(cur_graph.f);
  }
  
  let selx = getX();
  // x can come from mouse, from scrubber or not come at all
  if(selx) {
    main_graph.drawSelection(getX());
    packet_data = main_graph.disToProj(getX(),0);
    packet_data[1] = cur_graph.f(packet_data[0]);
    emitData('vals', packet_data);
  }

  if(playing) {
    getrektscrub += getrektscrub_step;
    if(getrektscrub > main_graph.ranges.display.max.x) {
      getrektscrub = main_graph.ranges.display.min.x;
    }
  }
  else if(mouseGracePeriod > 0) {
    mouseGracePeriod -= 1;
  }
  image(main_graph.static_gb,0,0);
  image(main_graph.trace_gb,0,0);
  image(main_graph.marks_gb,0,0);
}

function setupNet(callback = undefined) {
  socket = io();
  net_error = false;
  
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

function emitData(name, data = undefined) {
  if(socket.connected) {
    socket.emit(name, data);
  } else if(!net_error) {
    console.error('Error: no connection!');
    net_error = true;
  }
}

function getX() {
  if(playing) {
    return getrektscrub;
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

function Playpause() {
  playing = !playing;
  mouseGracePeriod = 20;
}

