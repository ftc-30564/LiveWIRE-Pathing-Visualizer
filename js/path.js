class Path {
    constructor() {
        this.waypoints = [new Waypoint(50, 50, 0).withName("Waypoint0"), new Waypoint(75, 75, 45).withName("Waypoint1")];
        this.selectedWaypointIndex = null;
    }

    addWaypoint(waypoint) {
        this.waypoints.push(waypoint);
        this.updateWaypointChain();
    }

    removeWaypoint(index) {
        this.waypoints.splice(index, 1);
        this.updateWaypointChain();
    }

    removeSelectedWaypoint() {
        if (this.selectedWaypointIndex != null) {
            this.removeWaypoint(this.selectedWaypointIndex);
        }
        this.selectedWaypointIndex = null;
    }

    moveWaypoint(waypointIndex, newX, newY) {
        this.waypoints[waypointIndex].x = newX;
        this.waypoints[waypointIndex].y = newY;
        this.updateWaypointChain();
    }

    selectWaypoint(index) {
        if (this.selectedWaypointIndex != null) {
            this.waypoints[this.selectedWaypointIndex].selected = false;
        }
        this.selectedWaypointIndex = index;
        this.waypoints[index].selected = true;
    }

    deselectWaypoint() {
        if (this.selectedWaypointIndex != null) {
            this.waypoints[this.selectedWaypointIndex].selected = false;
        }
        this.selectedWaypointIndex = null;
    }

    // updates the distances between each waypoint
    updateWaypointDistances() {
        let runningDistance = 0;
        for (let x = 1; x < this.waypoints.length; x ++) {
            runningDistance += this.waypoints[x].distanceFrom(this.waypoints[x-1]);
            this.waypoints[x].distanceIntoPath = runningDistance;
        }
    }

    updateWaypointEndingVelocities() {
        this.waypoints[0].endingVelocity = 0;
        this.waypoints[this.waypoints.length-1].endingVelocity = 0;

        for (let x = 1; x < this.waypoints.length-1; x++) {
            let angleDifference = this.waypoints[x].angleWithRadians(this.waypoints[x+1]) - this.waypoints[x-1].angleWithRadians(this.waypoints[x]);
            this.waypoints[x].endingVelocity = Math.min((Math.abs(Math.cos(angleDifference / 2)) * Settings.getSlowdownDefault()) * this.waypoints[x].maxVelocity, this.waypoints[x].maxVelocity);
        }
    }

    // any time a new waypoint is created, or waypoints are moved, this should be called.
    // this updates the distances and ending velocities between the two 
    updateWaypointChain() {
        this.updateWaypointDistances();
        this.updateWaypointEndingVelocities();
    }
}