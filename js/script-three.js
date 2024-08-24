console.log("three.js Version: " + THREE.REVISION);

let container, gui, stats;
let scene, camera1, camera2, renderer;
let controls2, clock;
let time, frame = 0;

function initThree() {
    scene = new THREE.Scene();

    const fov = 75;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 10000;
    camera1 = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    camera2 = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    container = document.getElementById("container-three");
    container.appendChild(renderer.domElement);

    gui = new dat.GUI();

    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.domElement);

    setupThree(); // *** 

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    stats.update();
    time = performance.now();
    frame++;
    updateThree(); // ***

    renderer.render(scene, currentCamera);
}

window.addEventListener("resize", function () {
    camera1.aspect = window.innerWidth / window.innerHeight;
    camera1.updateProjectionMatrix();
    camera2.aspect = window.innerWidth / window.innerHeight;
    camera2.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function releaseMouse() {
    // put the position out of the renderer with an arbitrary value
    mouse.set(-10000, -10000);
}
