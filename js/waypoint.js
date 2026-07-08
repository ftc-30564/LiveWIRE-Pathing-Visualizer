class Waypoint {
    constructor(x, y, theta) {
        this.x = x;
        this.y = y;
        this.theta = theta;

        this.name = "Waypoint";
        this.maxVelocity = Settings.getMaxVelocityDefault();
        this.maxAcceleration = Settings.getMaxAccelDefault();
        this.maxDeceleration = Settings.getMaxDecelDefault();
        this.tolerance = Settings.getToleranceDefault();
        this.endingVelocity = 0;

        this.selected = false;
        this.dropdownEnabled = false;

        this.distanceIntoPath = 0;
    }

    withName(name) {
        let ret = new Waypoint(this.x, this.y, this.theta);
        ret.name = name;
        return ret;
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

// version of Waypoint used solely for exporting as json
class StrippedWaypoint {
    constructor(waypoint) {
        this.name = waypoint.name;
        this.x = waypoint.x;
        this.y = waypoint.y;
        this.theta = waypoint.theta;

        this.maxVelocity = +waypoint.maxVelocity;
        this.maxAcceleration = +waypoint.maxAcceleration;
        this.maxDeceleration = +waypoint.maxDeceleration;
        this.endingVelocity = +waypoint.endingVelocity;
        this.tolerance = +waypoint.tolerance;
    }
}