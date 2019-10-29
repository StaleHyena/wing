let demowin_gb;
let main_graph;
let socket;
let canvas;

let screen_ratio;
let cur_graph;
let cur_demo;
let num_clients;

let playing;
let getrektscrub;
let getrektscrub_step;

// I'm salty about them changing this
let mousePressed;
let mouseGracePeriod;

let pallete;

let adminValidated;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight - windowHeight*UI_height);
  canvas.mousePressed(updateMouse);
  canvas.mouseReleased(updateMouse);
  screen_ratio = windowWidth/windowHeight;

  main_graph = new Graph(width,height);
  //new Graph(120, 100);
  num_clients = 0;

  pallete = {
    'accent': color(224, 29, 88),
    'bg': color(240, 229, 223),
    'text': color(8, 15, 38),
  }
  
  playing = false;
  getrektscrub = 0;

  mousePressed = false;
  mouseGracePeriod = 0;

  demowin_gb = createGraphics(width, height);

  main_graph.updateRanges([PI/2,1, -PI,5*PI, -1.2,1.2]);
  main_graph.updateGrid();

  adminValidated = false;
  setupNet();

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
}

function draw() {
  background(0);
  if(mouseIsPressed) {
    main_graph.drawGraph(cur_graph.f);
  }
  main_graph.drawSelection(getX());
  image(main_graph.static_gb,0,0);
  image(main_graph.trace_gb,0,0);
  image(main_graph.marks_gb,0,0);
  let vals = main_graph.disToProj(getX(),0);
  vals[1] = cur_graph.f(vals[0]);

  // Don't send data if we aren't definitely admin
  if(adminValidated) {
    emitData('vals', vals);
  }

  if(playing) {
    getrektscrub += getrektscrub_step;
    if(getrektscrub > width) {
      getrektscrub = 0;
    }
  }
  else if(mouseGracePeriod > 0) {
    mouseGracePeriod -= 1;
  }
}

function setupNet() {
  noLoop(); // As socket can turn undefined based on the acknowledgement
  socket = io();
  socket.emit('admin', null, (amAdmin) => {
    adminValidated = amAdmin;
    if(!amAdmin) {
      socket.disconnect();
    }
    loop();
  }); // try to become admin
  socket.on('clients', (c) => {
    num_clients = c - 1;
    updateClientCount(num_clients);
  });
  socket.on('disconnect', (reason) => {
    console.error('Disconnected from server -- ' + reason);
  });
}

function emitData(name, data) {
  if(socket.connected) {
    socket.emit(name, data);
  } else {
    console.error('Error: no connection!');
  }
}

function getX() {
  if(playing) {
    return getrektscrub;
  } else if (mousePressed) {
    return mouseX;
  }
  return -1;
}

function updateMouse() {
  if(mouseGracePeriod == 0 && mouseIsPressed) {
    mousePressed = true;
  } else {
    mousePressed = false;
  }
}

function Playpause() {
  playing = !playing;
  mouseGracePeriod = 20;
}

