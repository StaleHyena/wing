graph_funcs = [
  {'name':'sin','f':(x)=>{return sin(x);}},
  {'name':'cos','f':(x)=>{return cos(x);}},
  {'name':'tan','f':(x)=>{return tan(x);}},
  {'name':'cos*sin','f':(x)=>{return cos(x)*sin(x);}},
  {'name':'normal sin','f':(x)=>{return (sin(x)/2)+1/2;}},
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

