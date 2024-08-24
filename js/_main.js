let params = {
    color: "#FFF",
    cameraX: 0,
    cameraY: -150,
    cameraZ: 0,
    cameraRX: 0,
    cameraRY: 0,
    cameraRZ: 0,
    poseScale: 100,
};

let room1Cube;
let room2Canvas, room3Canvas;
let backgroundCube;
let player;
let raycaster, mouse, intersections, isIntersecting;
let space1, mirror1, space2, mirror2_1, mirror2_2, space3, mirror3, bed, box;
let lines = [];
let space1Material = [];
let base, button;
let end = false;
let endScene;
let currentCamera;

let moveVel = 0.0;
let rotateVel = 0.02;
let moveAcc = 2.5;
let direction;

const WORLD_HALF = 500;
const VIDEO_WIDTH = 640;
const PLAYER_OFFSET = 100;
const WORLD_OFFSET = 200;
const PI = Math.PI;

function setupThree() {
    endScene = getPlane();
    endScene.position.set(0, 100, -30);
    endScene.scale.set(0.099, 0.066, 0.033);

    // end = true;
    currentCamera = camera1;

    camera1.position.set(0, -150, 0);
    camera2.position.set(-1200, 0, -300);
    direction = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, -1), Math.PI * 0);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const textureLoader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();
    const cubeLoader = new THREE.CubeTextureLoader();
    cubeLoader.setPath('assets/');
    backgroundCube = cubeLoader.load([
        'px.png', 'nx.png',
        'py.png', 'ny.png',
        'pz.png', 'nz.png'
    ]);
    scene.background = backgroundCube;

    room1Cube = textureLoader.load("assets/imastudio.png");

    // dat.gui
    const gui = new dat.GUI();

    // controls
    clock = new THREE.Clock();
    controls2 = new OrbitControls(camera2, renderer.domElement);

    // scene 1
    space1 = getSphere();
    space1.material = new THREE.MeshBasicMaterial({
        map: room1Cube,
        side: THREE.BackSide,
    });
    space1.rotation.y = PI / 2;
    mirror1 = getMirror();
    mirror1.position.y = -WORLD_HALF / 2;
    mirror1.position.z = WORLD_HALF / 2 - 30;
    mirror1.rotation.y = PI;

    // load 3D models
    bed = gltfLoader.load("assets/models/Bed_01.gltf", function (gltf) {
        gltf.scene.scale.set(20, 20, 20);
        gltf.scene.position.set(-5, -WORLD_HALF / 2, -WORLD_HALF / 2 + 20);
        gltf.scene.rotation.y = -PI / 2;
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                child.frustumCulled = false;
                child.castShadow = true;
                child.material.emissive = child.material.color;
                child.material.emissiveMap = child.material.map;
            }
        })
        scene.add(gltf.scene);
        return gltf.scene;
    });

    // scene 2
    room2Canvas = new THREE.CanvasTexture(sketch2.canvas.elt);
    room2Canvas.minFilter = THREE.LinearFilter;
    room2Canvas.magFilter = THREE.LinearFilter;
    room2Canvas.colorSpace = THREE.SRGBColorSpace;

    space2 = getSpace();
    space2.position.set(0, 0, WORLD_HALF + WORLD_OFFSET);
    space2.material.map = room2Canvas;
    space2.material.side = THREE.BackSide;

    mirror2_1 = getMirror();
    mirror2_1.position.y = -WORLD_HALF / 2;
    mirror2_1.position.z = WORLD_HALF + WORLD_OFFSET - WORLD_HALF / 2 + 30;
    mirror2_1.rotation.y = 0;

    mirror2_2 = getMirror();
    mirror2_2.position.y = -WORLD_HALF / 2;
    mirror2_2.position.z = WORLD_HALF + WORLD_OFFSET + WORLD_HALF / 2 - 30;
    mirror2_2.rotation.y = PI;

    // scene 3
    box = getBox();
    box.scale.set(510, 510, 510);
    box.position.set(0, 0, 2 * (WORLD_HALF + WORLD_OFFSET));
    box.material.color.set(0, 0, 0);
    box.material.side = THREE.BackSide;

    space3 = getSpace();
    space3.position.set(0, 0, 2 * (WORLD_HALF + WORLD_OFFSET));
    space3.material.wireframe = true;
    space3.material.side = THREE.BackSide;

    base = getBox();
    base.scale.set(40, 85, 40);
    base.geometry.translate(0, 0.5, 0);
    base.position.set(0, -WORLD_HALF / 2, 2 * (WORLD_HALF + WORLD_OFFSET));

    button = getCylinder();
    button.scale.set(12, 10, 12);
    button.geometry.translate(0, 0.5, 0);
    button.position.set(0, -WORLD_HALF / 2 + 85, 2 * (WORLD_HALF + WORLD_OFFSET))

    mirror3 = getMirror();
    mirror3.position.y = -WORLD_HALF / 2;
    mirror3.position.z = 2 * (WORLD_HALF + WORLD_OFFSET) - WORLD_HALF / 2 + 30;
    mirror3.rotation.y = 0;


    // load line body
    /* lines */
    // left_eye
    lines.push(new Bar(sketch1.pose.left_eye_outer, sketch1.pose.left_eye));
    lines.push(new Bar(sketch1.pose.left_eye, sketch1.pose.left_eye_inner));
    // right_eye
    lines.push(new Bar(sketch1.pose.right_eye_outer, sketch1.pose.right_eye));
    lines.push(new Bar(sketch1.pose.right_eye, sketch1.pose.right_eye_inner));
    // _mouth
    lines.push(new Bar(sketch1.pose.mouth_left, sketch1.pose.mouth_right));
    // _ears
    lines.push(new Bar(sketch1.pose.left_ear, sketch1.pose.right_ear));

    // torso
    lines.push(new Bar(sketch1.pose.left_shoulder, sketch1.pose.right_shoulder));
    lines.push(new Bar(sketch1.pose.right_shoulder, sketch1.pose.right_hip));
    lines.push(new Bar(sketch1.pose.right_hip, sketch1.pose.left_hip));
    lines.push(new Bar(sketch1.pose.left_hip, sketch1.pose.left_shoulder));

    // left leg
    lines.push(new Bar(sketch1.pose.left_hip, sketch1.pose.left_knee));
    lines.push(new Bar(sketch1.pose.left_knee, sketch1.pose.left_ankle));
    lines.push(new Bar(sketch1.pose.left_heel, sketch1.pose.left_foot_index));

    // right leg
    lines.push(new Bar(sketch1.pose.right_hip, sketch1.pose.right_knee));
    lines.push(new Bar(sketch1.pose.right_knee, sketch1.pose.right_ankle));
    lines.push(new Bar(sketch1.pose.right_heel, sketch1.pose.right_foot_index));

    // left arm
    lines.push(new Bar(sketch1.pose.left_shoulder, sketch1.pose.left_elbow));
    lines.push(new Bar(sketch1.pose.left_elbow, sketch1.pose.left_wrist));
    // left hand
    lines.push(new Bar(sketch1.pose.left_wrist, sketch1.pose.left_thumb));
    lines.push(new Bar(sketch1.pose.left_wrist, sketch1.pose.left_index));
    lines.push(new Bar(sketch1.pose.left_wrist, sketch1.pose.left_pinky));

    // right arm
    lines.push(new Bar(sketch1.pose.right_shoulder, sketch1.pose.right_elbow));
    lines.push(new Bar(sketch1.pose.right_elbow, sketch1.pose.right_wrist));
    // left hand
    lines.push(new Bar(sketch1.pose.right_wrist, sketch1.pose.right_thumb));
    lines.push(new Bar(sketch1.pose.right_wrist, sketch1.pose.right_index));
    lines.push(new Bar(sketch1.pose.right_wrist, sketch1.pose.right_pinky));

    player = new THREE.Group();
    for (let line of lines) {
        player.add(line);
    }
    scene.add(player);

    // GUI
    // gui.add(params, "poseScale", 0, 500);
    releaseMouse();
}

function updateThree() {
    const delta = clock.getDelta();
    controls2.update(delta);
    raycaster.setFromCamera(mouse, currentCamera);
    intersections = raycaster.intersectObjects(scene.children);
    if (intersections.length > 0) {
        if (intersections[0].object.uuid == button.uuid) {
            button.material.color.set(200, 200, 0);
            button.position.y = -WORLD_HALF / 2 + 84;
            isIntersecting = true;
        } else {
            button.material.color.set(255, 0, 0);
            button.position.y = -WORLD_HALF / 2 + 85;
            isIntersecting = false;
        }
    }
    room2Canvas.needsUpdate = true;
    camera2.lookAt(new THREE.Vector3(0, 0, WORLD_HALF + WORLD_OFFSET));
    for (const line of lines) {
        line.update();
    }

    if (end) {
        currentCamera.position.set(0, 100, 0);
        currentCamera.rotation.set(0, 0, 0);
        scene.add(endScene);
    }

    if (camera1.position.x >= -30 && camera1.position.x < 30) {
        if (camera1.position.z >= mirror1.position.z - 5 && camera1.position.z < 375) { // mirror1 to mirror2_1
            camera1.position.z = mirror2_1.position.z + 60;
        } else if (camera1.position.z < mirror2_1.position.z + 30 && camera1.position.z >= WORLD_HALF + WORLD_OFFSET - WORLD_HALF / 2) { // mirror2_1 to mirror1
            camera1.position.z = mirror1.position.z - 30;
        }
        else if (camera1.position.z >= mirror2_2.position.z - 5 && camera1.position.z < WORLD_HALF + WORLD_OFFSET + WORLD_HALF / 2) { // mirror2_2 to mirror3
            camera1.position.z = mirror3.position.z + 60;
        } else if (camera1.position.z < mirror3.position.z + 30 && camera1.position.z >= 2 * (WORLD_HALF + WORLD_OFFSET) - WORLD_HALF / 2) { // mirror3 to mirror2_2
            camera1.position.z = mirror2_2.position.z - 60;
        }
    }

    if (keyIsPressed) {
        let axis, vector, quaternion;
        switch (keyCode) {
            case 87: // w
                moveVel = moveAcc;
                vector = new THREE.Vector3(0, 0, 1); // ***
                vector.applyQuaternion(direction);
                vector.normalize();
                vector.multiplyScalar(-moveVel); // negative
                camera1.position.add(vector);
                return;
            case 83: // s
                moveVel = moveAcc;
                vector = new THREE.Vector3(0, 0, 1); // ***
                vector.applyQuaternion(direction);
                vector.normalize();
                vector.multiplyScalar(moveVel); // positive
                camera1.position.add(vector);
                return;
            case 81: // q
                axis = new THREE.Vector3(0, 1, 0);
                quaternion = new THREE.Quaternion().setFromAxisAngle(axis, rotateVel); // positive
                direction.multiply(quaternion);
                camera1.rotation.y += rotateVel;
                return;
            case 69: // e
                axis = new THREE.Vector3(0, 1, 0);
                quaternion = new THREE.Quaternion().setFromAxisAngle(axis, -rotateVel); // negative
                direction.multiply(quaternion);
                camera1.rotation.y -= rotateVel;
                return;
            case 65: // a
                moveVel = moveAcc;
                vector = new THREE.Vector3(1, 0, 0); // ***
                vector.applyQuaternion(direction);
                vector.normalize();
                vector.multiplyScalar(-moveVel); // positive
                camera1.position.add(vector);
                return;
            case 68: // d
                moveVel = moveAcc;
                vector = new THREE.Vector3(1, 0, 0); // ***
                vector.applyQuaternion(direction);
                vector.normalize();
                vector.multiplyScalar(moveVel); // positive
                camera1.position.add(vector);
                return;
        }
    }
}

function keyPressed() {
    if (keyCode == ENTER) {
        if (currentCamera == camera1) {
            currentCamera = camera2;
        } else {
            currentCamera = camera1;
        }
    }

}
function mousePressed() {
    if (isIntersecting) {
        end = true;
    }
}

function getBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
}

function getSpace() {
    const geometry = new THREE.BoxGeometry(WORLD_HALF, WORLD_HALF, WORLD_HALF);
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
}

function getSphere() {
    const geometry = new THREE.SphereGeometry(375, 16, 32);
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
}

function getCylinder() {
    const geometry = new THREE.CylinderGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
}

function getPlane() {
    let map = new THREE.TextureLoader().load("assets/end_scene.png");
    const geometry = new THREE.PlaneGeometry(WORLD_HALF * 2, WORLD_HALF * 2, 100, 100);
    const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: map,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function getMirror() {
    let sprite = getSprite();
    sprite.scale.set(60, 130);
    sprite.position.set(0, 45, 3);
    let frame = getBox();
    frame.scale.set(50, 90, 5);
    frame.geometry.translate(0, 0.5, 0);
    frame.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/models/Wood_D.jpg"),
    });

    let glass = new THREE.PlaneGeometry(45, 85);
    let reflector = new Reflector(glass, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0xcccccc,
    });
    reflector.position.set(0, 45, 3);

    const group = new THREE.Group();
    group.scale.set(2, 2, 2);
    group.add(frame);
    group.add(reflector);
    group.add(sprite);
    scene.add(group);
    scene.remove(frame);
    scene.remove(reflector);
    return group;
}

function getSprite() {
    const map = new THREE.TextureLoader().load('assets/sprite.png');
    map.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({
        color: 0xcccccc,
        map: map,
        depthTest: true,
        blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(material);
    // scene.add(sprite);
    return sprite;
}

function updateWithBodypose(mesh, keypoint, confidenceThreshold = 0.1) {
    if (keypoint.score > confidenceThreshold) {
        mesh.visible = true;
        mesh.position.x = map(keypoint.x, 0, VIDEO_WIDTH, 1.0, -1.0) * params.poseScale; // x: should be flipped!
        mesh.position.y = map(keypoint.y, 0, VIDEO_WIDTH, 1.0, -1.0) * params.poseScale; // y: should be flipped! 
        mesh.position.z = keypoint.z * params.poseScale * -0.5; // z: is also flipped.
    } else {
        mesh.visible = false;
    }
}

function toRadians(x) {
    return x / 57.295779513;
}

function toDegs(x) {
    return x * 57.295779513;
}

class Bar {
    constructor(start, end) {
        this.mesh = getBox();
        // scene.add(this.mesh);

        this.mesh.scale.set(5, 3, 3);
        this.mesh.geometry.translate(0.5, 0, 0);

        this.start = start;
        this.end = end;
        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;
        this.z1 = 0;
        this.z2 = 0;
        this.theta = 0;

    }
    update() {
        const confidenceThreshold = 0.1;
        if (this.start.score < confidenceThreshold || this.end.score < confidenceThreshold) {
            this.mesh.visible = false;
            return;
        } else {
            this.mesh.visible = true;
        }

        this.x1 = map(this.start.x, 0, VIDEO_WIDTH, 1.0, -1.0) * params.poseScale + camera1.position.x; // flipped!
        this.x2 = map(this.end.x, 0, VIDEO_WIDTH, 1.0, -1.0) * params.poseScale + camera1.position.x; // flipped!
        this.y1 = map(this.start.y, 0, VIDEO_WIDTH, 1.0, -1.0) * params.poseScale - PLAYER_OFFSET; // flipped!
        this.y2 = map(this.end.y, 0, VIDEO_WIDTH, 1.0, -1.0) * params.poseScale - PLAYER_OFFSET; // flipped!
        this.z1 = this.start.z * params.poseScale * -0.5 + camera1.position.z - 30; // flipped.
        this.z2 = this.end.z * params.poseScale * -0.5 + camera1.position.z - 30; // flipped.
        this.theta = -(camera1.rotation.y - PI);

        // rotation of a point (x1, y1) around a point (x0, y0) to (x2, y2) by theta angle:
        // x2 = (x1 - x0) * cos(theta) - (y1 - y0) * sin(theta) + x0
        // y2 = (y1 - y0) * cos(theta) + (x1 - x0) * sin(theta) + y0
        let startVector = new THREE.Vector3();
        startVector.x = (this.x1 - camera1.position.x) * cos(this.theta) - (this.z1 - camera1.position.z) * sin(this.theta) + camera1.position.x;
        startVector.y = this.y1;
        startVector.z = (this.z1 - camera1.position.z) * cos(this.theta) + (this.x1 - camera1.position.x) * sin(this.theta) + camera1.position.z;

        let endVector = new THREE.Vector3();
        endVector.x = (this.x2 - camera1.position.x) * cos(this.theta) - (this.z2 - camera1.position.z) * sin(this.theta) + camera1.position.x;
        endVector.y = this.y2;
        endVector.z = (this.z2 - camera1.position.z) * cos(this.theta) + (this.x2 - camera1.position.x) * sin(this.theta) + camera1.position.z;

        let direction = new THREE.Vector3().subVectors(endVector, startVector); // target - origin
        let distance = direction.length();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction.normalize());

        this.mesh.position.copy(startVector);
        this.mesh.rotation.setFromQuaternion(quaternion);
        this.mesh.scale.x = distance;
    }
}
