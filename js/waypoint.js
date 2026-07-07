const DEFAULT_VELOCITY = 40;
const DEFAULT_ACCEL = 50;
const DEFAULT_DECEL = 50;
const DEFAULT_WAYPOINT_TOLERANCE = 3;

class Waypoint {
    constructor(x, y, theta) {
        this.x = x;
        this.y = y;
        this.theta = theta;

        this.name = "Waypoint";
        this.maxVelocity = DEFAULT_VELOCITY;
        this.maxAcceleration = DEFAULT_ACCEL;
        this.maxDeceleration = DEFAULT_DECEL;
        this.tolerance = DEFAULT_WAYPOINT_TOLERANCE;
        this.endingVelocity = 0;

        this.selected = false;

        this.dropdownEnabled = false;

        this.sidebarElement = null;

        this.distanceIntoPath = 0;
    }

    setSidebarElement(element) {
        this.sidebarElement = element;
    }

    add(other) {
        return new Waypoint(this.x + other.x, this.y + other.y, this.theta + other.theta);
    }

    minus(other) {
        return new Waypoint(this.x - other.x, this.y - other.y, this.theta - other.theta);
    }

    distanceFrom(other) {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
    }

    getAngleRadians() {
        return this.theta * (Math.PI / 180);
    }

    angleWithRadians(other) {
        return Math.atan2(other.y - this.y, other.x - this.x);
    }

    setSelected(selected) {
        this.selected = selected;
        if (this.sidebarElement != null) {
            if (this.selected) {
                this.sidebarElement.style.border = "3px solid yellow";
            }
            else {
                this.sidebarElement.style.border = "none";
            }
        }
    }
}

var waypoints = [new Waypoint(50, 50, 0), new Waypoint(75, 75, 45)];

// updates the distances between each waypoint, used for animation
function updateWaypointDistances() {
    let runningDistance = 0;
    for (let x = 1; x < this.waypoints.length; x ++) {
        runningDistance += this.waypoints[x].distanceFrom(this.waypoints[x-1]);
        this.waypoints[x].distanceIntoPath = runningDistance;
    }
}

function updateWaypointEndingVelocities() {
    this.waypoints[0].endingVelocity = 0;
    this.waypoints[this.waypoints.length-1].endingVelocity = 0;

    for (let x = 1; x < this.waypoints.length-1; x++) {
        let angleDifference = this.waypoints[x].angleWithRadians(this.waypoints[x+1]) - this.waypoints[x-1].angleWithRadians(this.waypoints[x]);
        this.waypoints[x].endingVelocity = (Math.abs(Math.cos(angleDifference / 2))) * this.waypoints[x].maxVelocity;
    }
}

// any time a new waypoint is created, or waypoints are moved, this should be called.
// this updates the distances and ending velocities between the two 
function updateWaypointChain() {
    this.updateWaypointDistances();
    this.updateWaypointEndingVelocities();
}