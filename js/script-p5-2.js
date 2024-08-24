// Separate p5.js sketches in instance mode

const s2 = (sketch) => {
    sketch.setup = function () {
        sketch.canvas = sketch.createCanvas(400, 400);
        sketch.canvas.hide();
        sketch.colorMode(HSB, 100);
        sketch.frameRate(30);
    }

    sketch.draw = function () {
        sketch.background(0);
        for (let x = 0; x <= sketch.width / 2; x++) {
            sketch.stroke((x + sketch.frameCount) % 100, 100, 100);
            sketch.noFill();
            sketch.rect(x, x, sketch.width / 2 - 2 * x, sketch.height / 2 - 2 * x);
            sketch.rect(x, sketch.height / 2 + x, sketch.width / 2 - 2 * x, sketch.height / 2 - 2 * x);
            sketch.rect(sketch.width / 2 + x, sketch.height / 2 + x, sketch.width / 2 - 2 * x, sketch.height / 2 - 2 * x);
            sketch.rect(sketch.width / 2 + x, x, sketch.width / 2 - 2 * x, sketch.height / 2 - 2 * x);
        }

    }

};

let sketch2 = new p5(s2, "container-p5");