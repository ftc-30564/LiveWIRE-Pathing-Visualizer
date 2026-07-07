class Export {
    constructor() {    
        this.displayingJava = false;
    }

    exportJava() {
        let ret = "";

        for (let x = 0; x < waypoints.length; x ++) {
            // TODO: use waypoint.name when added
            ret += `\n\t\tWaypoint ${waypoints[x].name} = new Waypoint(new Pose2d(${waypoints[x].x}, ${waypoints[x].y}, Math.toRadians(${waypoints[x].theta})), ${waypoints[x].maxAcceleration}, ${waypoints[x].maxDeceleration}, ${waypoints[x].maxVelocity}, ${waypoints[x].endingVelocity});`;
        }
        

        ret += `\n\n\t\tPath path = new Path(${waypoints[0].name})`;

        for (let x = 1; x < waypoints.length; x++) {
            ret += `\n\t\t\t.addWaypoint(${waypoints[x].name})`
        }
        ret += ";";

        return ret;
    }

    toggleJava() {
        if (!this.displayingJava) {
            this.showJava();
        }
        else {
            this.hideJava();
        }
    }

    showJava() {
        this.displayingJava = true;
        document.getElementById("java-generation").style.display = "block";
        document.getElementById("java-code").innerText = this.exportJava();
        document.getElementById("main").style.opacity = "70%";
    }

    hideJava() {
        this.displayingJava = false;
        document.getElementById("java-generation").style.display = "none";
        document.getElementById("main").style.opacity = "100%";
    }
}

const exporter = new Export();