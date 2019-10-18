class Graph {
    static_gb;
    trace_gb;
    marks_gb;
    origin;

    ranges = {
        'projection': {
            'min':{'x':0,'y':0},
            'max':{'x':0,'y':0},
            'width':0,
            'height':0,
        },
        'display': {
            'min':{'x':0,'y':0},
            'max':{'x':0,'y':0},
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
        this.updateGrid();
    }

    updateGrid(cell_size) {
        let s_gb = this.static_gb;
        s_gb.background(this.pallete.bg);
        let grid_c = this.pallete.grid;
        let axis_c = this.pallete.axis;
        let grid_w = this.style.weights.grid;
        let axis_w = this.style.weights.axis;

        let dis = this.ranges.display;
        let proj = this.ranges.projection;
        let orig = this.origin;
        let w = dis.width;
        let h = dis.height;

        let cell_size = createVector(
            w/proj.width,
            h/proj.height
        );
        //console.log('display = ('+dis.width+','+dis.height+')');
        console.log('cell_size = '+cell_size.toString());

        for(let x = dis.min.x; x < w; x += cell_size.x) {
            s_gb.strokeWeight(grid_w);
            s_gb.stroke(grid_c);
            if(floor(x) == orig.x) {
                s_gb.strokeWeight(axis_w);
                s_gb.stroke(axis_c);
            }
            s_gb.line(x,0, x,h);
        }
        for(let y = dis.min.y; y < h; y += cell_size.y) {
            s_gb.strokeWeight(grid_w);
            s_gb.stroke(grid_c);
            if(floor(y) == orig.y) {
                s_gb.strokeWeight(axis_w);
                s_gb.stroke(axis_c);
            }
            s_gb.line(0,y, w,y);
        }
    }

    updateRanges(vals) {
        let proj = this.ranges.projection;
        let dis = this.ranges.display;
        let pad = this.style.padding;
        let s_gb = this.static_gb;
        let orig = this.origin;
        let w = s_gb.width;
        let h = s_gb.height;

        proj.min.x = vals[0];
        proj.max.x = vals[1];
        proj.min.y = vals[2];
        proj.max.y = vals[3];
        proj.width  = proj.max.x - proj.min.x;
        proj.height = proj.max.y - proj.min.y;

        dis.min.x = pad;
        dis.max.x = w - pad;
        dis.min.y = pad;
        dis.max.y = h - pad;
        dis.width  = dis.max.x - dis.min.x;
        dis.height = dis.max.y - dis.min.y;

        // Get origin from projection
        orig.x = map(0, proj.min.x,proj.max.x, dis.min.x,dis.max.x);
        orig.y = map(0, proj.min.y,proj.max.y, dis.min.y,dis.max.y);
        console.log('origin = ('+orig.x+','+orig.y+')');
    }
    
    drawGraph(graph_func) {
        let t_gb = this.trace_gb;
        let p   = this.ranges.projection;
        let dis = this.ranges.display;
        let dw = dis.width;
        let dh = dis.height;
        let orig = this.origin;
        
        let resolution = 10;
        let step = p.width / resolution;

        let trace_c = this.pallete.trace;
        let trace_w = this.style.weights.trace;
        
        let prev = createVector(dis.min.x,orig.y);

        t_gb.clear();
        t_gb.strokeWeight(trace_w);
        t_gb.stroke(trace_c);
        for(let x = p.min.x; x < p.max.x; x += step) {
            let sx = map(x, p.min.x,p.max.x, dis.min.x,dis.max.x);
            let input_x = x;
            // "Inverted" because y grows upwards, against the coord system
            let y = map(graph_func(input_x), p.min.y,p.max.y, dis.max.y,dis.min.y);
            t_gb.line(prev.x,prev.y, sx,y);
            prev.x = sx;
            prev.y = y;
        }
    }
}
