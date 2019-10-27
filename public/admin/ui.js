let UI_height = 0.2; //%

let func_sel;
let demo_sel;

let onNewGraph;

function setupUI(onNG) {
  func_sel = createSelect(true);
  demo_sel = createSelect(false);
  func_sel.position(10, 10);
  demo_sel.position(10, 20);
  for(let i = 0; i<graph_funcs.length; i++) {
    func_sel.option(graph_funcs[i].name);
  }

  onNewGraph = onNG;
  func_sel.changed(newGraphSelected);
  newGraphSelected(); // Call to get default
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
