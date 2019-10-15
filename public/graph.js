class Graph {
    static_gb;
    trace_gb;
    marks_gb;
    origin;

    ranges = {
        'val': {
            'min':{'x':0,'y':0},
            'max':{'x':0,'y':0},
        },
        'abs': {
            'min':{'x':0,'y':0},
            'max':{'x':0,'y':0},
        },
        'span': {
            'width':0,
            'height':0,
        },
    }
    pallete = {
        'bg': color(42),
        'grid': color(166),
        'trace': color(33, 107, 181),
        'mark': color(163, 30, 10),
        'axis': color(39, 112, 54),
    }
    style = {
        'weights': {
            'grid': 2,
            'axis':3.5,
            'trace':4,
            'mark':10,
        },
        'padding': 16,
    }

    constructor(w,h) {
        this.static_gb = createGraphics(w,h);
        this.trace_gb  = createGraphics(w,h);
        this.marks_gb  = createGraphics(w,h);
        this.origin = createVector(0,0);
        this.updateRanges([0, 2*PI, -2, 2]);
        this.updateGrid(6);
    }

    updateGrid(subd) {
        let s_gb = this.static_gb;
        s_gb.background(this.pallete.bg);
        let grid_c = this.pallete.grid;
        let axis_c = this.pallete.axis;
        let grid_w = this.style.weights.grid;
        let axis_w = this.style.weights.axis;

        let s = this.ranges.span;
        let abs = this.ranges.abs;
        let w = s.width;
        let h = s.height;
        // We can change all of these
        let step = createVector(
            h/subd,
            h/subd
        );

        for(let i = 0; i < w; i += step.x) {
            let x = abs.min.x + i;
            s_gb.strokeWeight(grid_w);
            s_gb.stroke(grid_c);
            if(floor(i) == origin.x) {
                s_gb.strokeWeight(axis_w);
                s_gb.stroke(axis_c);
            }
            s_gb.line(x,abs.min.y, x,abs.max.y);
        }
        for(let j = 0; j < h; j += step.y) {
            let y = abs.min.y + j;
            s_gb.strokeWeight(grid_w);
            s_gb.stroke(grid_c);
            if(floor(j) == origin.y) {
                s_gb.strokeWeight(axis_w);
                s_gb.stroke(axis_c);
            }
            s_gb.line(abs.min.x,y, abs.max.x,y);
        }
    }

    updateRanges(vals) {
        let val = this.ranges.val;
        let abs = this.ranges.abs;
        let span = this.ranges.span;
        let p = this.style.padding;
        let s = this.static_gb;
        let o = this.origin;
        let w = s.width;
        let h = s.height;

        val.min.x = vals[0];
        val.max.x = vals[1];
        val.min.y = vals[2];
        val.max.y = vals[3];

        abs.min.x = p;
        abs.max.x = w - p;
        abs.min.y = p;
        abs.max.y = h - p;

        span.width  = abs.max.x - abs.min.x;
        span.height = abs.max.y - abs.min.y;

        // Origin y axis is centered by default
        o.y = h/2;
    }
    
    drawGraph(graph_func) {
        let t_gb = this.trace_gb;
        let val = this.ranges.val;
        let abs = this.ranges.abs;
        let trace_c = this.pallete.trace;
        let trace_w = this.style.weights.trace;

        t_gb.strokeWeight(trace_w);
        t_gb.stroke(trace_c);
        for(let i = abs.min.x; i < abs.max.x; i++) {
            let x = i;// - origin.x;
            let scaled = map(i, abs.min.x, abs.max.x, val.min.x, val.max.x);
            let y = map(graph_func(scaled), val.min.y, val.max.y, abs.min.y, abs.max.y);// - origin.y;
            t_gb.point(x,y);
        }
    }
}
