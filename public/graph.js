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
        origin = createVector(0,0);
        updateRanges([0, 2*PI, -2, 2]);
        updateGrid(6);
    }

    updateGrid(subd) {
        let s_gb = this.static_gb;
        let grid_c = this.pallete.grid;
        let axis_c = this.pallete.axis;

        let s = this.ranges.span;
        let abs = this.ranges.abs;
        let w = s.width;
        let h = s.height;
        // We can change all of these
        let step = createVector(
            w/subd,
            w/subd
        );

        for(let i = 0; i < w; i += step.x) {
            let x = abs.min.x + i;
            s_gb.stroke(grid_c);
            if(floor(i) == origin.x) s_gb.stroke(axis_c);
            s_gb.line(x,abs.min.y, x,abs.max.y);
        }
        for(let j = 0; j < h; j += step.y) {
            let y = abs.min.y + i;
            s_gb.stroke(grid_c);
            // Origin y axis is centered by default
            if(floor(j) == origin.y+h/2) s_gb.stroke(axis_c);
            s_gb.line(abs.min.x,y, abs.max.x,y);
        }
    }

    updateRanges(vals) {
        let val = this.ranges.val;
        let abs = this.ranges.abs;
        let span = this.ranges.span;
        let p = this.style.padding;
        let s = this.static_gb;
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
    }

    draw(
}
