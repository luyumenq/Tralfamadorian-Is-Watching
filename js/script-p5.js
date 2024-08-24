// Bodypose: Blazepose on p5.js web editor
// https://editor.p5js.org/ml5/sketches/OukJYAJAb

// Initialize sketch
let bodypose;

function preload() {
    bodypose = ml5.bodypose("BlazePose"); // ***
}

function setup() {
    initThree();
}
