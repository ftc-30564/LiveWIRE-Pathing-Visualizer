class Export {
    constructor() {    
        this.displayingJava = false;
    }

    exportJava(path) {
        let ret = "";

        for (let x = 0; x < path.waypoints.length; x ++) {
            ret += `\n\t\tWaypoint ${path.waypoints[x].name} = new Waypoint(new Pose2d(${path.waypoints[x].x}, ${path.waypoints[x].y}, Math.toRadians(${path.waypoints[x].theta})), ${path.waypoints[x].maxAcceleration}, ${path.waypoints[x].maxDeceleration}, ${path.waypoints[x].maxVelocity}, ${path.waypoints[x].endingVelocity}, ${path.waypoints[x].tolerance});`;
        }
        

        let pathIndex = 1;
        ret += `\n\n\t\tPath path = new Path${pathIndex}(${path.waypoints[0].name})`;

        for (let x = 0; x < path.waypoints.length; x ++) {
            // alert(x);

            ret += `\n\t\t\t.addWaypoint(${path.waypoints[x].name})`

            if (path.waypoints[x].isPathBreak) {
                pathIndex++;
                ret += `\n\n\t\tPath path = new Path${pathIndex}(${path.waypoints[x].name})`;
            }
            //ret += `\n\n\t\tPath path = new Path${pathIndex}(${path.waypoints[x].name})`;

            // for (let y = x + 1; y < path.waypoints.length; y++) {
            //     ret += `\n\t\t\t.addWaypoint(${path.waypoints[y].name})`
            //     if (path.waypoints[y].isPathBreak) {
            //         ret += `\n\t\t\t.build()`;
            //         pathIndex++;
            //         break;
            //     }
            // }
        }

        ret += ";";

        return ret;
    }

    exportJson(path) {
        let strippedWaypoints = [];

        path.waypoints.forEach(waypoint => {
            strippedWaypoints.push(new StrippedWaypoint(waypoint));
        });

        var ret = {
            "name": "Path1",
            "waypoints": strippedWaypoints
        };

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