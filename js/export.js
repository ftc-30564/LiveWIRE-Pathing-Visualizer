class Export {
    constructor() {    
        this.displayingJava = false;
    }

    exportJava(path) {
        let ret = "";

        for (let x = 0; x < path.waypoints.length; x ++) {
            // TODO: use waypoint.name when added
            ret += `\n\t\tWaypoint ${path.waypoints[x].name} = new Waypoint(new Pose2d(${path.waypoints[x].x}, ${path.waypoints[x].y}, Math.toRadians(${path.waypoints[x].theta})), ${path.waypoints[x].maxAcceleration}, ${path.waypoints[x].maxDeceleration}, ${path.waypoints[x].maxVelocity}, ${path.waypoints[x].endingVelocity});`;
        }
        

        ret += `\n\n\t\tPath path = new Path(${path.waypoints[0].name})`;

        for (let x = 1; x < path.waypoints.length; x++) {
            ret += `\n\t\t\t.addWaypoint(${path.waypoints[x].name})`
        }
        ret += ";";

        return ret;
    }

    toggleJava(path) {
        if (!this.displayingJava) {
            this.showJava(path);
        }
        else {
            this.hideJava();
        }
    }

    // TODO probaby should be in main
    showJava(path) {
        this.displayingJava = true;
        document.getElementById("java-generation").style.display = "block";
        document.getElementById("java-code").innerText = this.exportJava(path);
        document.getElementById("main").style.opacity = "70%";
    }

    hideJava() {
        this.displayingJava = false;
        document.getElementById("java-generation").style.display = "none";
        document.getElementById("main").style.opacity = "100%";
    }
}