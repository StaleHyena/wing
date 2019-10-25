let UI_height = 0.2; //%

let func_selector;

function setupUI(demos) {
  func_selector = createSelect(true);
  let names = Object.keys(demos);
  for(let i = 0; i<names.length; i++) {
    func_selector.option(names[i]);
  }
}


