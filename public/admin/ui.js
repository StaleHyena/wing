let UI_height = 0.1; //%

let func_sel;
let demo_sel;
let clients_p;
let playerStep_s;
let playpause_btn;

let onNewGraph;
let onNewDemo;
let onNewStep;
let onPlaypause;

function setupUI(onNG, onND, onNS, onPPB) {
  let x = 10;
  func_sel = createSelect(false);
  demo_sel = createSelect(false);
  playerStep_s = createSlider(0.0, float(width/50), float(width/1000), width/100000);
  playpause_btn = createButton('\u23ef');
  playpause_btn.position(x, height - 2*x - playpause_btn.elt.clientHeight);
  func_sel.position(x, 3*x);
  let y = func_sel.elt.offsetTop + func_sel.elt.clientHeight + 20;
  demo_sel.position(x, y);

  for(let i = 0; i<graph_funcs.length; i++) {
    func_sel.option(graph_funcs[i].name);
  }
  for(let i = 0; i<demos.length; i++) {
    demo_sel.option(demos[i].name);
  }
  
  clients_p = createP();
  updateClientCount(0);

  onNewGraph = onNG;
  onNewDemo = onND;
  onNewStep = onNS;
  onPlaypause = onPPB;
  func_sel.changed(newGraphSelected);
  demo_sel.changed(newDemoSelected);
  playerStep_s.changed(newStepSelected);

  newGraphSelected(); // Call to get default
  newDemoSelected();
  newStepSelected();
  playpause_btn.mousePressed(onPPB);
}

function newGraphSelected() {
  cur_graph = graphFromName(func_sel.value());
  if(cur_graph == null) {
    console.log('Couldn\'t find graph named "'
      + func_sel.value() + '"!');
    cur_graph = graph_funcs[0];
  }
  console.log('New graph selected: ' + cur_graph.name + ' ' + cur_graph.f);
  onNewGraph(cur_graph);
}

function newDemoSelected() {
  cur_demo = demoFromName(demo_sel.value());
  if(cur_demo == null) {
    console.log('Couldn\'t find demo named "'
      + demo_sel.value() + '"!');
    cur_demo = demos[0];
  }
  console.log('New demo selected: ' + cur_demo.name + ' ' + cur_demo.f);
  onNewDemo(cur_demo);
}
 function newStepSelected() {
   onNewStep(playerStep_s.value());
 }

function updateClientCount(x) {
  clients_p.elt.innerText = String(x) + " clientes conectados";
}
