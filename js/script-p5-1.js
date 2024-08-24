// Separate p5.js sketches in instance mode

const s1 = (sketch) => {

    sketch.pose = {
        nose: { x: 0, y: 0, z: 0, score: 0 },
        left_eye_inner: { x: 0, y: 0, z: 0, score: 0 },
        left_eye: { x: 0, y: 0, z: 0, score: 0 },
        left_eye_outer: { x: 0, y: 0, z: 0, score: 0 },
        right_eye_inner: { x: 0, y: 0, z: 0, score: 0 },
        right_eye: { x: 0, y: 0, z: 0, score: 0 },
        right_eye_outer: { x: 0, y: 0, z: 0, score: 0 },
        left_ear: { x: 0, y: 0, z: 0, score: 0 },
        right_ear: { x: 0, y: 0, z: 0, score: 0 },
        mouth_left: { x: 0, y: 0, z: 0, score: 0 },
        mouth_right: { x: 0, y: 0, z: 0, score: 0 },
        left_shoulder: { x: 0, y: 0, z: 0, score: 0 },
        right_shoulder: { x: 0, y: 0, z: 0, score: 0 },
        left_elbow: { x: 0, y: 0, z: 0, score: 0 },
        right_elbow: { x: 0, y: 0, z: 0, score: 0 },
        left_wrist: { x: 0, y: 0, z: 0, score: 0 },
        right_wrist: { x: 0, y: 0, z: 0, score: 0 },
        left_pinky: { x: 0, y: 0, z: 0, score: 0 },
        right_pinky: { x: 0, y: 0, z: 0, score: 0 },
        left_index: { x: 0, y: 0, z: 0, score: 0 },
        right_index: { x: 0, y: 0, z: 0, score: 0 },
        left_thumb: { x: 0, y: 0, z: 0, score: 0 },
        right_thumb: { x: 0, y: 0, z: 0, score: 0 },
        left_hip: { x: 0, y: 0, z: 0, score: 0 },
        right_hip: { x: 0, y: 0, z: 0, score: 0 },
        left_knee: { x: 0, y: 0, z: 0, score: 0 },
        right_knee: { x: 0, y: 0, z: 0, score: 0 },
        left_ankle: { x: 0, y: 0, z: 0, score: 0 },
        right_ankle: { x: 0, y: 0, z: 0, score: 0 },
        left_heel: { x: 0, y: 0, z: 0, score: 0 },
        right_heel: { x: 0, y: 0, z: 0, score: 0 },
        left_foot_index: { x: 0, y: 0, z: 0, score: 0 },
        right_foot_index: { x: 0, y: 0, z: 0, score: 0 },
    };

    let video;
    let poses = [];
    let width = sketch.width;
    let height = sketch.height;

    sketch.setup = function () {
        sketch.canvas = sketch.createCanvas(640, 480);
        sketch.canvas.hide();
        video = sketch.createCapture(sketch.VIDEO);
        video.size(width, height);
        bodypose.detectStart(video, sketch.gotPoses)
    }

    sketch.draw = function () {
        sketch.drawMirroredCam();

        for (let i = 0; i < poses.length; i++) {
            let pose = poses[i];
            for (let j = 0; j < pose.keypoints.length; j++) {
                let keypoint = pose.keypoints[j];
                // Only draw a circle if the keypoint's confidence is greater than 0.1
                if (keypoint.score > 0.1) {
                    sketch.fill(0, 255, 0);
                    sketch.noStroke();
                    sketch.circle(keypoint.x, keypoint.y, 10);
                }
            }
        }
    }

    sketch.gotPoses = function (results) {
        // let's flip horizontally
        for (const pose of results) {
            for (const p of pose.keypoints) {
                p.x = video.width - p.x;
            }
        }
        poses = results;

        // update newPose with lerp()
        if (results.length > 0) {
            newPose = results[0].keypoints;
            const amount = 0.25;
            let index = 0;
            for (let point in sketch.pose) {
                sketch.pose[point].x = lerp(sketch.pose[point].x, newPose[index].x, amount);
                sketch.pose[point].y = lerp(sketch.pose[point].y, newPose[index].y, amount);
                sketch.pose[point].z = lerp(sketch.pose[point].z, newPose[index].z, amount);
                sketch.pose[point].score = newPose[index].score;
                index++;
            }
        }
    }

    sketch.drawMirroredCam = function (x, y, w) {
        if (w == undefined) w = video.width;

        sketch.push();
        // to position the video image
        sketch.translate(x, y);
        // to mirror the webvideo image
        sketch.translate(w, 0);
        sketch.scale(-1, 1);
        // draw the image on the origin position
        sketch.image(video, 0, 0);
        sketch.pop();
    }
};

let sketch1 = new p5(s1, "container-p5");