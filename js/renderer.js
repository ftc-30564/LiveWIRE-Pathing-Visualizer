const FIELD_WIDTH = 128;
const FIELD_HEIGHT = 128;

const canvas = document.getElementById("field-canvas");
const ctx = canvas.getContext("2d");

class Renderer {
    constructor(currentPath) {
        this.currentPath = currentPath;
        this.robot = new Robot();

        this.fieldImage = new Image();
        this.fieldImage.src = "biobuzz-field-rotated.png";

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

    drawArrow(x, y, theta, length) {
        let dirX = Math.cos(theta);
        let dirY = -Math.sin(theta);
        let arrowLength = length;
        let arrowX = x + dirX * arrowLength;
        let arrowY = y + dirY * arrowLength;

        ctx.beginPath();
        ctx.moveTo(x+0.5, y+0.5);
        ctx.lineTo(arrowX+0.5, arrowY+0.5);  
        ctx.strokeStyle = "rgba(247, 7, 7, 0.65)";
        ctx.lineWidth = 7;
        ctx.stroke();

        // let headLength = 10;
        // let leftX = arrowX - dirX * headLength - dirY * headLength;
        // let leftY = arrowY - dirY * headLength + dirX * headLength;
        // let rightX = arrowX - dirX * headLength + dirY * headLength;
        // let rightY = arrowY - dirY * headLength - dirX * headLength;

        // ctx.beginPath();
        // ctx.moveTo(arrowX+0.5, arrowY+0.5);
        // ctx.lineTo(leftX+0.5, leftY+0.5);
        // ctx.lineTo(rightX+0.5, rightY+0.5);
        // ctx.closePath();
        // ctx.fillStyle = "rgba(54, 186, 63, 0.65)";
        // ctx.fill();
    }

    // draws given waypoints on the field
    drawWaypoints() {
        let pathBreaks = this.currentPath.getDistancesOfPathBreaks();

        pathBreaks.unshift(0);

        // alert(pathBreaks);

        let currentRobotPathBreakIndex = 0;

        for (let i = 0; i < pathBreaks.length-1; i++) {
            if ((this.robotDistance >= pathBreaks[i]) && (this.robotDistance < pathBreaks[i+1])) {
                currentRobotPathBreakIndex = i;
                break;
            }
        }

        for (let i = 0; i < this.currentPath.waypoints.length; i++) {
            let waypoint = this.currentPath.waypoints[i];
            let x = Renderer.convertXInchesToPixels(waypoint.getAbsoluteWaypoint().x);
            let y = Renderer.convertYInchesToPixels(waypoint.getAbsoluteWaypoint().y);
            let theta = waypoint.getAbsoluteWaypoint().theta;

            this.drawArrow(x, y, ((theta) * Math.PI) / 180, 18);

            if (i != this.currentPath.waypoints.length-1) {
                ctx.lineWidth = 3;
                if ((this.currentPath.waypoints[i].distanceIntoPath >= pathBreaks[currentRobotPathBreakIndex] &&
                    this.currentPath.waypoints[i].distanceIntoPath <= pathBreaks[currentRobotPathBreakIndex + 1]) &&
                    (this.currentPath.waypoints[i+1].distanceIntoPath >= pathBreaks[currentRobotPathBreakIndex] &&
                    this.currentPath.waypoints[i+1].distanceIntoPath <= pathBreaks[currentRobotPathBreakIndex + 1])) {
                    ctx.strokeStyle = "rgb(71, 182, 255)";
                }
                else {
                    ctx.strokeStyle = "white";
                }
                ctx.lineCap = "butt";
                ctx.beginPath();
                ctx.moveTo(Renderer.convertXInchesToPixels(this.currentPath.waypoints[i].getAbsoluteWaypoint().x), Renderer.convertYInchesToPixels(this.currentPath.waypoints[i].getAbsoluteWaypoint().y));
                ctx.lineTo(Renderer.convertXInchesToPixels(this.currentPath.waypoints[i+1].getAbsoluteWaypoint().x), Renderer.convertYInchesToPixels(this.currentPath.waypoints[i+1].getAbsoluteWaypoint().y));
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = "white";
            ctx.fill();

            if (waypoint.selected) {
                ctx.lineWidth = 4;
                ctx.strokeStyle = "rgb(0, 143, 238)";
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }   
    }

    redrawEverything() {
        canvas.width = window.innerHeight - 90;
        canvas.height = window.innerHeight - 90;

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
        this.offsetTime = 0;
    }

    toggleAnimation() {
        if (this.running) {
            this.stopAnimation();
            return;
        }
        this.startAnimation();
    }

    resetAnimation() {
        this.startTime = performance.now();
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
                
        let timelinePercent = parseFloat(document.getElementById('timeline-handle').style.left) / 100;
        if (timelinePercent == null || isNaN(timelinePercent)) {
            timelinePercent = 0;
        }
        // alert(timelinePercent);
        // alert(timelinePercent);
        this.startTime = performance.now() - (timelinePercent * currentPath.totalAnimationTime * 1000);
        // alert(this.startTime);
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
        
        const percent = time / currentPath.totalAnimationTime;

        document.getElementById('timeline-handle').style.left = `${percent * 100}%`;
        document.getElementById('timeline-progress').style.width = `${percent * 100}%`;

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