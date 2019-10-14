let demowin_gb;

let main_graph;

let screen_ratio;
let demo_num;

let pallete;

function setup() {
    createCanvas(windowWidth, windowHeight);
    screen_ratio = windowWidth/windowHeight;

    console.log("a");
    main_graph = new Graph(width,height);

    pallete = {
        'accent': color(224, 29, 88),
        'bg': color(240, 229, 223),
        'text': color(8, 15, 38),
    }

    demowin_gb = createGraphics(width, height);

    demo_num = 0;

    main_graph.drawGraph((x) => { return Math.sin(x); });
}

function draw() {
    image(main_graph.static_gb,0,0);
    image(main_graph.marks_gb,0,0);
}


