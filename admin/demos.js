let graph_funcs = [
  {'name':'sin','e':'sin(x)'},
  {'name':'cos','e':'cos(x)'},
  {'name':'tan','e':'tan(x)'},
  {'name':'cos*sin','e':'cos(x)*sin(x)'},
  {'name':'normal sin','e':'(sin(x)/2)+1/2'},
  {'name':'csc','e':'1/sin(x)'},
  {'name':'sec','e':'1/cos(x)'},
  {'name':'cot','e':'cos(x)/sin(x)'},
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

