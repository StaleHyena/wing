function setupUI() {
  ui_div = select('#ui-bar');
  playpause_btn  = select('#playpause');
  graph_sel      = select('#graph-menu');
  demo_sel       = select('#demo-menu');
  clientCount_p  = select('#client-counter');
  step_slider    = createSlider(0.0, 1.0, 0.5, 0.001);
  step_slider.parent(select('#step-slider'));
  ui_elts = [playpause_btn,graph_sel,demo_sel,step_slider,clientCount_p];
  populateMenus();

  playpause_btn.mousePressed(Playpause);
  graph_sel.changed(newGraphIn);
  demo_sel.changed(newDemoIn);
  step_slider.changed(newStepIn);
}

function populateMenus() {
  let i,l;
  l = graph_funcs.length;
  for(i=0; i<l; i++) {graph_sel.option(graph_funcs[i].name);}
  l = demos.length;
  for(i=0; i<l; i++) {demo_sel.option(demos[i].name);}
}

function newGraphIn() {
  cur_graph = graphFromName(graph_sel.value());
  if(cur_graph == null) {
    console.log('Couldn\'t find graph named "'
      + graph_sel.value() + '"!');
    cur_graph = graph_funcs[0];
  }
  console.log('New graph selected: ' + cur_graph.name + ' ' + cur_graph.f);
  graph_d.drawGraph(cur_graph.f);
}

function newDemoIn() {
  cur_demo = demoFromName(demo_sel.value());
  if(cur_demo == null) {
    console.log('Couldn\'t find demo named "'
      + demo_sel.value() + '"!');
    cur_demo = demos[0];
  }
  console.log('New demo selected: ' + cur_demo.name + ' ' + cur_demo.f);
  emitData('demo', cur_demo.name);
}

function newStepIn() {
  // naive exponential slider
  let v = step_slider.value();
  scrub_step = map(pow(v,3), 0.0,1.0, 0.0,step_max);
}

function updateClientCount(x) {
  clientCount_p.elt.innerText = String(x) + " clientes conectados";
}

function Playpause() {
  scrubbing = !scrubbing;
  mouseGracePeriod = 20;
}

