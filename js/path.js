class Path {
    constructor() {
        this.waypoints = [new Waypoint(50, 50, 0).withName("Waypoint0"), new Waypoint(75, 75, 45).withName("Waypoint1")];
        this.selectedWaypointIndex = null;
        this.totalAnimationTime;
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

    // computes the time to accelerate, cruise, and decelerate for each waypoint.
    // this is used for animation, and stores each one to the waypoint
    computeTimeSegments() {
        this.totalAnimationTime = 0;
        for (let x = 0; x < this.waypoints.length-1; x++) {
            let waypoint = this.waypoints[x];

            // alert("Waypoint " + x);

            // TODO: compute max possible velocity, since accel/decel constraints might mean the robot never reaches max velocity

            
            waypoint.timeToAccelerate = (waypoint.maxVelocity - waypoint.endingVelocity) / waypoint.maxAcceleration;// correct
            // d = vi*t + (1/2)at^2
            waypoint.distanceToAccelerate = (waypoint.endingVelocity * waypoint.timeToAccelerate) + (1/2)*waypoint.maxAcceleration*Math.pow(waypoint.timeToAccelerate, 2);// correct

            waypoint.timeToDecelerate = (waypoint.maxVelocity - this.waypoints[x+1].endingVelocity) / waypoint.maxDeceleration;// correct
            // d = vi*t - (1/2)at^2
            waypoint.distanceToDecelerate = (waypoint.maxVelocity * waypoint.timeToDecelerate) - (1/2)*waypoint.maxDeceleration*Math.pow(waypoint.timeToDecelerate, 2);// correct

            waypoint.distanceToCruise = waypoint.distanceFrom(this.waypoints[x+1]) - (waypoint.distanceToAccelerate + waypoint.distanceToDecelerate);

            waypoint.timeToCruise = waypoint.timeToAccelerate + (waypoint.distanceToCruise / waypoint.maxVelocity);
            waypoint.timeToDecelerate += waypoint.timeToCruise;

            this.totalAnimationTime = waypoint.timeToDecelerate;

            // alert(waypoint.distanceFrom(this.waypoints[x+1]));
            // alert(waypoint.timeToAccelerate);
            // alert(waypoint.distanceToAccelerate);
            // alert(waypoint.timeToCruise);
            // alert(waypoint.distanceToCruise)
            // alert(waypoint.timeToDecelerate);
            // alert(waypoint.distanceToDecelerate);
        }
    }

    // calculates the distance along the path at a given timestamp (seconds)
    getDistanceAlongPath(time) {
        const debug = document.getElementById("debug-text");
        let previousSegmentDistances = 0;
        let previousSegmentTimes = 0;
        for (let x = 0; x < this.waypoints.length-1; x ++) {
            if (time > this.waypoints[x].timeToDecelerate) {
                previousSegmentDistances += this.waypoints[x].distanceFrom(this.waypoints[x+1]); // record distance elapsed
                previousSegmentTimes += this.waypoints[x].timeToAccelerate + this.waypoints[x].timeToCruise + this.waypoints[x].timeToDecelerate;
                continue;
            }
            let timeIntoPath = time - previousSegmentTimes;
            if (timeIntoPath < this.waypoints[x].timeToAccelerate) {
                debug.innerText = "acceleratin";
                //alert("acceleratin");
                let distanceAccelerating = (this.waypoints[x].endingVelocity * timeIntoPath) + (1/2)*this.waypoints[x].maxAcceleration*Math.pow(timeIntoPath, 2);
                return previousSegmentDistances + distanceAccelerating;
            }
            else if (timeIntoPath < this.waypoints[x].timeToCruise) {
                debug.innerText = "cruisin";
                //alert("cruisin");
                return previousSegmentDistances + this.waypoints[x].distanceToAccelerate + (this.waypoints[x].maxVelocity * (timeIntoPath - this.waypoints[x].timeToAccelerate));
            }
            else {
                //
                
                // alert(this.waypoints[x].timeToAccelerate + this.waypoints[x].timeToCruise);
                //alert("deceleratin");
                let timeIntoDeceleration = (timeIntoPath - this.waypoints[x].timeToCruise);
                debug.innerText = timeIntoDeceleration;
                //alert(timeIntoDeceleration);
                let distanceDecelerating = (this.waypoints[x].maxVelocity * timeIntoDeceleration) - (1/2)*this.waypoints[x].maxDeceleration*Math.pow(timeIntoDeceleration, 2);
                return previousSegmentDistances + this.waypoints[x].distanceToAccelerate + this.waypoints[x].distanceToCruise + distanceDecelerating;
            }
        }
    }
}