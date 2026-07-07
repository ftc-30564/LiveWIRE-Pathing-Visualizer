class Robot {
    constructor() {
        this.width = 18;
        this.height = 18;

        this.lineThickessPixels = 10;
    }

    // draws onto a given waypoint
    drawOntoWaypoint(waypoint) {
        ctx.save();

        ctx.translate(
            convertXInchesToPixels(waypoint.x), 
            convertYInchesToPixels(waypoint.y)
        );

        ctx.rotate((-(waypoint.theta - 90) * Math.PI) / 180);

        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";

        // since the rectangle is drawn with its corner at the waypoint, recalculate
        // the new X and Y to where the center is over the waypoint
        ctx.fillRect(
            -(this.width*(canvas.width / FIELD_WIDTH))/2, 
            -(this.height*(canvas.height / FIELD_HEIGHT))/2, 
            this.width*(canvas.width / FIELD_WIDTH),
            this.height*(canvas.height / FIELD_HEIGHT));

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";

        ctx.fillRect(
            -(this.lineThickessPixels / 2),
            -this.height*(canvas.height / FIELD_HEIGHT)/2,
            this.lineThickessPixels,
            this.height*(canvas.height / FIELD_HEIGHT)/2 * (1/2));



        ctx.restore();
    }

    // Draws the robot a distance into given waypoints
    drawOntoPath(distance, waypoints) {
        // first figure out which waypoints it falls between
        let lastWaypoint;
        let nextWaypoint;
        if (waypoints.length == 1) {
            lastWaypoint = waypoints[0];
            nextWaypoint = waypoints[0];
        }
        if (waypoints.length == 2) {
            lastWaypoint = waypoints[0];
            nextWaypoint = waypoints[1];
        }
        else {
            for (let x = 1; x < waypoints.length; x ++) {
                if (waypoints[x].distanceIntoPath > distance) {
                    //alert("distance is " + distance + ", waypoint last is " + (x-1));
                    lastWaypoint = waypoints[x-1];
                    nextWaypoint = waypoints[x];
                    break;
                }
            }
        }


        // next, figure out what x and y the robot should be at
        let robotX = lastWaypoint.x + (Math.cos(lastWaypoint.angleWithRadians(nextWaypoint)) * (distance - lastWaypoint.distanceIntoPath));
        let robotY = lastWaypoint.y + (Math.sin(lastWaypoint.angleWithRadians(nextWaypoint)) * (distance - lastWaypoint.distanceIntoPath));

        // interpolation for now
        // TODO: there are different heading strategies that need to be added
        let robotAngle = lastWaypoint.theta + ((nextWaypoint.theta - lastWaypoint.theta) * ((distance - lastWaypoint.distanceIntoPath) / (nextWaypoint.distanceIntoPath - lastWaypoint.distanceIntoPath)));
        
        this.drawOntoWaypoint(new Waypoint(robotX, robotY, robotAngle));
    }
}