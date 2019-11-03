let graph_funcs = [
  {'name':'sin','f':(x)=>{return p.sin(x);}},
  {'name':'cos','f':(x)=>{return p.cos(x);}},
  {'name':'tan','f':(x)=>{return p.tan(x);}},
  {'name':'cos*sin','f':(x)=>{return p.cos(x)*p.sin(x);}},
  {'name':'normal sin','f':(x)=>{return (p.sin(x)/2)+1/2;}},
  {'name':'csc','f':(x)=>{return 1.0/p.sin(x);}},
  {'name':'sec','f':(x)=>{return 1.0/p.cos(x);}},
  {'name':'cot','f':(x)=>{return p.cos(x)/p.sin(x);}},
];

// Copy for demos
function graphFromName(name) {
  let arr = graph_funcs;
  for(let i=0; i<arr.length; i++) {
    if(arr[i].name == name) {
      return arr[i];
    }
  }
  return null;
}

export { graph_funcs, graphFromName };

