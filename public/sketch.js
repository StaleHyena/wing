let demowin_gb;
let main_graph;

let screen_ratio;
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

    demo_num = 3;

    setupUI(demo_funcs);

    main_graph.drawGraph(demo_funcs['sin']);
}

function draw() {
    background(0);
    image(main_graph.static_gb,0,0);
    image(main_graph.trace_gb,0,0);
    if(mouseIsPressed) {
        let r = map(
            mouseX, 0, width,
            0, 4*PI
        );
        main_graph.updateRanges([PI,1 ,-2*PI,r, -2,2]);
        main_graph.updateGrid();
        main_graph.drawGraph(demo_funcs['sin']);
    }
}

