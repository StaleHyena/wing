let demowin_gb;
let main_graph;
let socket;

let screen_ratio;
let cur_graph;
let demo_num;

let pallete;

function setup() {
  createCanvas(windowWidth, windowHeight - windowHeight*UI_height);
  screen_ratio = windowWidth/windowHeight;

  main_graph = new Graph(width,height);
  //new Graph(120, 100);

  pallete = {
    'accent': color(224, 29, 88),
    'bg': color(240, 229, 223),
    'text': color(8, 15, 38),
  }

  demowin_gb = createGraphics(width, height);

  demo_num = 0;
  main_graph.updateRanges([PI/2,1, 0,2*PI, -2,2]);
  main_graph.updateGrid();

  setupUI((graph) => {
    cur_graph = graph;
    main_graph.drawGraph(graph.f);
  });
  setupNet();
}

function draw() {
  background(0);
  if(mouseIsPressed) {
    /*
    let r = map(
      mouseX, 0, width,
      0, 4*PI
    );
    main_graph.updateRanges([PI,1,-r,r, -2,2]);
    main_graph.updateGrid();
    */
    main_graph.drawGraph(cur_graph.f);
  }
  main_graph.drawSelection(mouseX);
  image(main_graph.static_gb,0,0);
  image(main_graph.trace_gb,0,0);
  image(main_graph.marks_gb,0,0);
  let vals = main_graph.disToProj(mouseX,0);
  vals[1] = cur_graph.f(vals[0]);
  emitData(vals, demo_num);
}

function setupNet() {
  socket = io();
}

function emitData(vals, demo) {
  if(socket) {
    socket.emit('vals', vals);
    socket.emit('demo', demo);
  } else {
    console.error('Error: no connection!');
  }
}

