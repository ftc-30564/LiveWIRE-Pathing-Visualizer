class Path {
    constructor(name) {
        this.name = name;
        this.selected = false;
        this.waypoints = [new Waypoint(50, 50, 0).withName("way0"), new Waypoint(75, 75, 45).withName("way1")];
        this.selectedWaypointIndex = null;
        this.totalAnimationTime;
        this.updateWaypointChain();
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
        this.waypoints[waypointIndex].setAbsoluteX(newX);
        this.waypoints[waypointIndex].setAbsoluteY(newY);
        this.updateWaypointChain();
    }

    selectWaypoint(index) {
        this.deselectWaypoint();
        
        this.selectedWaypointIndex = index;
        this.waypoints[index].selected = true;

        this.waypoints[index].sidebarElement.style.border = "5px solid rgb(0, 143, 238)";
    }

    deselectWaypoint() {
        if (this.selectedWaypointIndex != null) {
            this.waypoints[this.selectedWaypointIndex].sidebarElement.style.border = "none";
            this.waypoints[this.selectedWaypointIndex].selected = false;
        }
        this.selectedWaypointIndex = null;
    }

    rotateSelectedWaypoint(deltaTheta) {
        if (this.selectedWaypointIndex != null) {
            this.waypoints[this.selectedWaypointIndex].theta += deltaTheta;
        }
    }

    // updates the distances between each waypoint
    updateWaypointDistances() {
        let runningDistance = 0;
        for (let x = 1; x < this.waypoints.length; x ++) {
            runningDistance += this.waypoints[x].distanceFrom(this.waypoints[x-1]);
            this.waypoints[x].distanceIntoPath = runningDistance;
        }
    }

    getDistancesOfPathBreaks() {
        let ret = [];
        let runningDistance = 0;
        for (let x = 1; x < this.waypoints.length; x ++) {
            runningDistance += this.waypoints[x].distanceFrom(this.waypoints[x-1]);

            if (this.waypoints[x].isPathBreak) {
                ret.push(runningDistance);
            }
        }
        ret.push(runningDistance); // add the end of the path as a path break
        return ret;
    }

    updateWaypointEndingVelocity(index) {
        if (index == 0 || index == this.waypoints.length-1 || this.waypoints[index].isPathBreak) {
            this.waypoints[index].endingVelocity = 0;
            return;
        }

        let angleDifference = this.waypoints[index].getAbsoluteWaypoint().angleWithRadians(this.waypoints[index+1].getAbsoluteWaypoint()) - this.waypoints[index-1].getAbsoluteWaypoint().angleWithRadians(this.waypoints[index].getAbsoluteWaypoint());
        this.waypoints[index].endingVelocity = Math.min((Math.abs(Math.cos(angleDifference / 2)) * Settings.getSlowdownDefault()) * this.waypoints[index].maxVelocity, this.waypoints[index].maxVelocity);
    }

    // any time a new waypoint is created, or waypoints are moved, this should be called.
    // this updates the distances and ending velocities between the two 
    updateWaypointChain() {
        this.updateWaypointDistances();
    }

    // computes the time to accelerate, cruise, and decelerate for each waypoint.
    // this is used for animation, and stores each one to the waypoint
    computeTimeSegments() {
        this.totalAnimationTime = 0;
        for (let x = 0; x < this.waypoints.length-1; x++) {
            let waypoint = this.waypoints[x].getAbsoluteWaypoint();

            // alert("Waypoint " + x);

            // TODO: compute max possible velocity, since accel/decel constraints might mean the robot never reaches max velocity

            
            waypoint.timeAtAccelerationEnd = (waypoint.maxVelocity - waypoint.endingVelocity) / waypoint.maxAcceleration;
            // d = vi*t + (1/2)at^2
            waypoint.distanceToAccelerate = (waypoint.endingVelocity * waypoint.timeAtAccelerationEnd) + (1/2)*waypoint.maxAcceleration*Math.pow(waypoint.timeAtAccelerationEnd, 2);// correct

            let timeToDecelerate = (waypoint.maxVelocity - this.waypoints[x+1].endingVelocity) / waypoint.maxDeceleration;
            
            // d = vi*t - (1/2)at^2
            waypoint.distanceToDecelerate = (waypoint.maxVelocity * timeToDecelerate) - (1/2)*waypoint.maxDeceleration*Math.pow(timeToDecelerate, 2);// correct

            waypoint.distanceToCruise = waypoint.distanceFrom(this.waypoints[x+1]) - (waypoint.distanceToAccelerate + waypoint.distanceToDecelerate);

            waypoint.timeAtCruiseEnd = waypoint.timeAtAccelerationEnd + (waypoint.distanceToCruise / waypoint.maxVelocity);
            waypoint.timeAtDecelerationEnd = waypoint.timeAtCruiseEnd + timeToDecelerate;

            this.totalAnimationTime += waypoint.timeAtDecelerationEnd;
            
            // alert(x);
            // alert(waypoint.distanceFrom(this.waypoints[x+1]));
            // alert("ending vel: " + this.waypoints[x+1].endingVelocity);
            // alert("time at accel end: " + waypoint.timeAtAccelerationEnd);
            // alert("distance to accel: " + waypoint.distanceToAccelerate);
            // alert("time at cruise end: " + waypoint.timeAtCruiseEnd);
            // alert("distance to cruise: " + waypoint.distanceToCruise)
            // alert("time at decel end: " + waypoint.timeAtDecelerationEnd);
            // alert("distance to decel: " + waypoint.distanceToDecelerate);
        }
    }

    // calculates the distance along the path at a given timestamp (seconds)
    getDistanceAlongPath(time) {
        const debug = document.getElementById("debug-text");
        let previousSegmentDistances = 0;
        let previousSegmentTimes = 0;
        for (let x = 0; x < this.waypoints.length-1; x ++) {
            if (time > (previousSegmentTimes + this.waypoints[x].timeAtDecelerationEnd)) {
                previousSegmentDistances += this.waypoints[x].distanceFrom(this.waypoints[x+1]); // record distance elapsed
                previousSegmentTimes += this.waypoints[x].timeAtDecelerationEnd;
                continue;
            }
            let timeIntoPath = time - previousSegmentTimes;

            // if it's past the end of the path
            // if (timeIntoPath > this.waypoints[x].timeAtDecelerationEnd) {
            //     return this.waypoints[x].distanceIntoPath;
            // }

            if (timeIntoPath < this.waypoints[x].timeAtAccelerationEnd) {
                //debug.innerText = "acceleratin";
                //alert("acceleratin");

                // calculate, based on the given time, how far in the acceleration it is.
                let distanceAccelerating = (this.waypoints[x].endingVelocity * timeIntoPath) + (1/2)*this.waypoints[x].maxAcceleration*Math.pow(timeIntoPath, 2);
                return previousSegmentDistances + distanceAccelerating;
            }
            else if (timeIntoPath < this.waypoints[x].timeAtCruiseEnd) {
                //debug.innerText = "cruisin";
                //alert("cruisin");
                return previousSegmentDistances + this.waypoints[x].distanceToAccelerate + (this.waypoints[x].maxVelocity * (timeIntoPath - this.waypoints[x].timeAtAccelerationEnd));
            }
            else {
                // alert(this.waypoints[x].timeAtAccelerationEnd + this.waypoints[x].timeAtCruiseEnd);
                //alert("deceleratin");
                let timeIntoDeceleration = (timeIntoPath - this.waypoints[x].timeAtCruiseEnd);
                // alert("Deceleratin");
                //debug.innerText = "deceleratin";
                //alert(timeIntoDeceleration);
                let distanceDecelerating = (this.waypoints[x].maxVelocity * timeIntoDeceleration) - (1/2)*this.waypoints[x].maxDeceleration*Math.pow(timeIntoDeceleration, 2);
                return previousSegmentDistances + this.waypoints[x].distanceToAccelerate + this.waypoints[x].distanceToCruise + distanceDecelerating;
            }
        }

        return this.waypoints[this.waypoints.length-1].distanceIntoPath;
    }
}