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

        this.timeAtAccelerationEnd = 0;
        this.timeToCruise = 0;
        this.timeToDecelerate = 0;

        this.distanceToAccelerate = 0;
        this.distanceToCruise = 0;
        this.distanceToDecelerate = 0;

        this.selected = false;
        this.dropdownEnabled = false;
        this.sidebarElement = null;

        this.linked = false;
        this.linkedWaypoint = null;

        // if it is the last waypoint in a path
        this.isPathBreak = false;

        this.distanceIntoPath = 0;
    }

    static newWaypoint(name, x, y, theta, maxVelocity, maxAcceleration, maxDeceleration, endingVelocity, tolerance) {
        let wp = new Waypoint(x, y, theta);
        wp.name = name;
        wp.maxVelocity = maxVelocity;
        wp.maxAcceleration = maxAcceleration;
        wp.maxDeceleration = maxDeceleration;
        wp.endingVelocity = endingVelocity;
        wp.tolerance = tolerance;
        return wp;
    }

    withName(name) {
        let ret = new Waypoint(this.x, this.y, this.theta);
        ret.name = name;
        return ret;
    }

    linkTo(other) {
        this.linked = true;
        this.linkedWaypoint = other;
    }

    unlink() {
        this.linked = false;
        this.linkedWaypoint = null;
    }

    // returns the absolute position of the waypoint, taking into account if the waypoint is linked to anything
    getAbsoluteWaypoint() {
        if (this.linked) {
            return this.add(this.linkedWaypoint.getAbsoluteWaypoint());
        }
        return this;
    }

    setAbsoluteX(x) {
        if (this.linked) {
            this.x = x - this.linkedWaypoint.getAbsoluteWaypoint().x;
        }
        else {
            this.x = x;
        }
    }

    setAbsoluteY(y) {
        if (this.linked) {
            this.y = y - this.linkedWaypoint.getAbsoluteWaypoint().y;
        }
        else {
            this.y = y;
        }
    }

    setAbsoluteTheta(theta) {
        if (this.linked) {
            this.theta = theta - this.linkedWaypoint.getAbsoluteWaypoint().theta;
        }
        else {
            this.theta = theta;
        }
    }

    static fromJson(obj) {
        let ret = new Waypoint(obj.x, obj.y, obj.theta);

        ret.name = obj.name;
        ret.maxVelocity = obj.maxVelocity;
        ret.maxAcceleration = obj.maxAcceleration;
        ret.endingVelocity = obj.endingVelocity;
        ret.tolerance = obj.tolerance;
        ret.isPathBreak = obj.isPathBreak;

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
        return Math.sqrt(Math.pow(this.getAbsoluteWaypoint().x - other.getAbsoluteWaypoint().x, 2) + Math.pow(this.getAbsoluteWaypoint().y - other.getAbsoluteWaypoint().y, 2))
    }

    getAngleRadians() {
        return this.theta * (Math.PI / 180);
    }

    angleWithRadians(other) {
        return Math.atan2(other.getAbsoluteWaypoint().y - this.getAbsoluteWaypoint().y, other.getAbsoluteWaypoint().x - this.getAbsoluteWaypoint().x);
    }

    setSelected(selected) {
        this.selected = selected;
        if (this.sidebarElement != null) {
            if (this.selected) {
                this.sidebarElement.style.border = "3px solid rgb(0, 143, 238)";
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

        this.isPathBreak = waypoint.isPathBreak;


    }
}