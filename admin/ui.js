import { demos, demoFromName } from '../client/demos.js';
import { graph_presets, graphFromName } from './demos.js';
import { create, all } from 'mathjs/number'

const math = create(all);
class UserInterface {
  init() {
    this.ui_div = p.select('#ui-bar');
    this.playpause_btn  = p.select('#playpause');
    this.expr_sel      = p.select('#expr-menu');
    this.demo_sel       = p.select('#demo-menu');
    this.clientCount_p  = p.select('#client-counter');
    this.status_p       = p.select('#status-txt');
    this.step_slider    = p.createSlider(0.0, 1.0, 0.5, 0.001);
    this.step_slider.parent(p.select('#step-slider'));
    this.expr_field     = p.createInput('sin(x)');
    this.expr_field.parent(p.select('#expr-bar'));
    this.callbacks = new Map();
    this.populateMenus();

    this.playpause_btn.mousePressed(playpause);
    this.expr_sel.changed(newGraphIn);
    this.demo_sel.changed(newDemoIn);
    this.step_slider.changed(newStepIn);
    this.expr_field.input(newExpr);
  }

  post() {
    // Initialize with default values
    newGraphIn();
    newDemoIn();
    newStepIn();
  }

  populateMenus() {
    let i,l;
    l = graph_presets.length;
    for(i=0; i<l; i++) { this.expr_sel.option(graph_presets[i].name); }
    l = demos.length;
    for(i=0; i<l; i++) { this.demo_sel.option(demos[i].name); }
  }

  updateClientCount(c) {
    if(c == 0) {
      this.clientCount_p.elt.innerText = "Nenhum cliente conectado";
    } else {
      let suff = (c > 1)? " clientes conectados" : " cliente conectado";
      this.clientCount_p.elt.innerText = String(c) + suff;
    }
  }

  addCallback(name, f) {
    this.callbacks.set(name, f);
  }

  updateStatus(txt, clr) {
    this.status_p.elt.innerText = txt;
    this.status_p.style('color', clr);
  }
}

let ui = new UserInterface();
export default ui;

// Because they are called by events, they don't receive the implict this
export function newGraphIn() {
  let name = ui.expr_sel.value();
  let g = graphFromName(name);
  if(g == null) {
    console.log('Couldn\'t find graph named "' + name + '"!');
    g = graph_presets[0];
  }
  console.log('New graph selected: ' + g.name);
  ui.expr_field.value(g.e);
  newExpr();
  let c = ui.callbacks.get('graph');
  if(c) { c(g); }
}

export function newDemoIn() {
  let name = ui.demo_sel.value();
  let d = demoFromName(name);
  if(d == null) {
    console.log('Couldn\'t find demo named "' + name + '"!');
    d = demos[0];
  }
  console.log('New demo selected: ' + d.name);
  let c = ui.callbacks.get('demo');
  if(c) { c(d); }
}

export function newStepIn() {
  let v = ui.step_slider.value();
  let c = ui.callbacks.get('step');
  if(c) { c(v); }
}

export function playpause() {
  let c = ui.callbacks.get('play/pause');
  if(c) { c(); }
}

export function newExpr() {
  let e = ui.expr_field.value();
  try {
    let r = math.compile(e);
    let c = ui.callbacks.get('expr');
    if(c) { c(r, 'a'); }
  } catch(err) {
    console.error(err);
    return undefined;
  }
}

