const FIELD_WIDTH = 128;
const FIELD_HEIGHT = 128;

const canvas = document.getElementById("field-canvas");
const ctx = canvas.getContext("2d");

class Renderer {
    constructor(currentPath) {
        this.currentPath = currentPath;
        this.robot = new Robot();

        this.fieldImage = new Image();
        this.fieldImage.src = "decode-field.png";

        this.fieldImage.onload = () => {
            this.redrawEverything();
        };

        this.robotDistance = 0;
    }

    static convertXPixelsToInches(x) {
        return x * (FIELD_WIDTH / canvas.width);
    }

    static convertYPixelsToInches(y) {
        return FIELD_HEIGHT - (y * (FIELD_HEIGHT / canvas.height));
    }

    static convertXInchesToPixels(x) {
        return x * (canvas.width / FIELD_WIDTH);
    }

    static convertYInchesToPixels(y) {
        return canvas.height - (y * (canvas.height / FIELD_HEIGHT));
    }

    static isWithinSquare(x, y, rx, ry, rl) {
        return ((Math.abs(rx - x) < (rl / 2)) && (Math.abs(ry - y) < (rl / 2)));
    }

    clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawImage() {
        ctx.drawImage(this.fieldImage, 0, 0, canvas.width, canvas.height); 
    }

    // draws given waypoints on the field
    drawWaypoints() {
        for (let i = 0; i < this.currentPath.waypoints.length; i++) {
            let waypoint = this.currentPath.waypoints[i];
            let x = Renderer.convertXInchesToPixels(waypoint.x);
            let y = Renderer.convertYInchesToPixels(waypoint.y);
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = "white";
            ctx.fill();

            if (i != this.currentPath.waypoints.length-1) {
                ctx.lineWidth = 4;
                ctx.strokeStyle = "white";
                ctx.lineCap = "butt";
                ctx.beginPath();
                ctx.moveTo(Renderer.convertXInchesToPixels(this.currentPath.waypoints[i].x), Renderer.convertYInchesToPixels(this.currentPath.waypoints[i].y));
                ctx.lineTo(Renderer.convertXInchesToPixels(this.currentPath.waypoints[i+1].x), Renderer.convertYInchesToPixels(this.currentPath.waypoints[i+1].y));
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
        this.robot.drawOntoPath(this.robotDistance, this.currentPath.waypoints);
    }
}

class Animator {
    constructor(renderer) {
        this.renderer = renderer;
        this.running = false;
        this.startTime = 0;
    }

    toggleAnimation() {
        if (this.running) {
            this.stopAnimation();
            return;
        }
        this.startAnimation();
    }

    resetAnimation() {
        this.startTime = 0;
        this.running = false;
        this.renderer.redrawEverything();
        currentPath.computeTimeSegments();
    }

    startAnimation() {
        if (this.running) {
            return;
        }
        currentPath.computeTimeSegments();
        this.running = true;
        this.startTime = performance.now();
        requestAnimationFrame(() => this.runAnimationTime());
    }

    runAnimationDistance() {
        this.renderer.robotDistance += 0.7;        

        if (this.renderer.robotDistance > this.renderer.currentPath.waypoints[this.renderer.currentPath.waypoints.length-1].distanceIntoPath) {
            this.renderer.robotDistance = 0;
        }

        this.renderer.redrawEverything();

        if (this.running) {
            requestAnimationFrame(() => this.runAnimationDistance());
        }
    }

    runAnimationTime() {
        let time = (performance.now() - this.startTime) / 1000;

        this.renderer.robotDistance = currentPath.getDistanceAlongPath(time);
        this.renderer.redrawEverything();
        

        if (time > currentPath.totalAnimationTime) {
            this.startTime = performance.now();
        }

        if (this.running) {
            requestAnimationFrame(() => this.runAnimationTime());
        }
    }

    stopAnimation() {
        this.running = false;
    }
}