const FIELD_WIDTH = 128;
const FIELD_HEIGHT = 128;

const canvas = document.getElementById("field-canvas");
const ctx = canvas.getContext("2d");

function convertXPixelsToInches(x) {
    return x * (FIELD_WIDTH / canvas.width);
}

function convertYPixelsToInches(y) {
    return FIELD_HEIGHT - (y * (FIELD_HEIGHT / canvas.height));
}

function convertXInchesToPixels(x) {
    return x * (canvas.width / FIELD_WIDTH);
}

function convertYInchesToPixels(y) {
    return canvas.height - (y * (canvas.height / FIELD_HEIGHT));
}

function isWithinSquare(x, y, rx, ry, rl) {
    return ((Math.abs(rx - x) < (rl / 2)) && (Math.abs(ry - y) < (rl / 2)));
}

class Renderer {
    constructor(waypoints) {
        this.waypoints = waypoints;
        this.robot = new Robot();

        this.fieldImage = new Image();
        this.fieldImage.src = "decode-field.png";

        this.fieldImage.onload = () => {
            this.redrawEverything();
        };

        this.robotDistance = 0;
    }

    clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawImage() {
        ctx.drawImage(this.fieldImage, 0, 0, canvas.width, canvas.height); 
    }

    // draws given waypoints on the field
    drawWaypoints() {
        for (let i = 0; i < this.waypoints.length; i++) {
            let waypoint = this.waypoints[i];
            let x = convertXInchesToPixels(waypoint.x);
            let y = convertYInchesToPixels(waypoint.y);
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = "white";
            ctx.fill();

            if (i != waypoints.length-1) {
                ctx.lineWidth = 4;
                ctx.strokeStyle = "white";
                ctx.lineCap = "butt";
                ctx.beginPath();
                ctx.moveTo(convertXInchesToPixels(this.waypoints[i].x), convertYInchesToPixels(this.waypoints[i].y));
                ctx.lineTo(convertXInchesToPixels(this.waypoints[i+1].x), convertYInchesToPixels(this.waypoints[i+1].y));
                ctx.stroke();
            }

            if (waypoint.selected) {
                ctx.lineWidth = 4;
                ctx.strokeStyle = "yellow";
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }   
    }

    redrawEverything() {
        canvas.width = window.innerHeight - 50;
        canvas.height = window.innerHeight - 50;

        this.clear();
        this.drawImage();
        this.drawWaypoints();
        this.robot.drawOntoPath(this.robotDistance, this.waypoints);
    }
}

const renderer = new Renderer(waypoints);

window.addEventListener("resize", () => {
    renderer.redrawEverything();
});

this.running = false;

function toggleAnimation() {
    if (running) {
        stopAnimation();
        return;
    }
    startAnimation();
}

function resetAnimation() {
    renderer.robotDistance = 0;
    running = false;
    renderer.redrawEverything();
}

function startAnimation() {
    if (running) {
        return;
    }
    running = true;
    requestAnimationFrame(runAnimation);
}

function runAnimation() {
    renderer.robotDistance += 0.7;

    if (renderer.robotDistance > waypoints[waypoints.length-1].distanceIntoPath) {
        renderer.robotDistance = 0;
    }

    renderer.redrawEverything();

    if (running) {
        requestAnimationFrame(runAnimation);
    }
}

function stopAnimation() {
    running = false;
}