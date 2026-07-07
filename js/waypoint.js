const DEFAULT_VELOCITY = 40;
const DEFAULT_ACCEL = 50;
const DEFAULT_DECEL = 50;
const DEFAULT_WAYPOINT_TOLERANCE = 3;

class Waypoint {
    constructor(x, y, theta) {
        this.x = x;
        this.y = y;
        this.theta = theta;

        this.maxVelocity = DEFAULT_VELOCITY;
        this.maxAcceleration = DEFAULT_ACCEL;
        this.maxDeceleration = DEFAULT_DECEL;
        this.waypointTolerance = DEFAULT_WAYPOINT_TOLERANCE;

        this.selected = false;

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

    angleWith(other) {
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

var waypoints = [new Waypoint(50, 50, 0)];