

const WAYPOINT_TOLERANCE = 3;


class Sidebar {
    constructor(currentPath, renderer) {
        this.currentPath = currentPath;
        this.renderer = renderer;
    }

    // clears and writes all the html for the waypoints on the sidebar
    initializeSidebar() {
        document.getElementById("waypoints").innerHTML = "";

        for (let i = 0; i < this.currentPath.waypoints.length; i++) {
            let html = "";

            html = `
                    <div class="waypoint" id="waypoint-${i}">
                    <button style="position: absolute; top: 10px; right: 10px;" id="link-${i}">Link</button>
                    <input type="text" class="waypoint-name" id="name-${i}" value="${this.currentPath.waypoints[i].name}"></input>
                    <div class="coordinates">
                        <label>X:</label>
                        <input type="number" class="waypoint-coordinate" id="x-${i}" value="${this.currentPath.waypoints[i].x.toFixed(2)}">
                        <label class="unit">in</label>

                        <label>Y:</label>
                        <input type="number" class="waypoint-coordinate" id="y-${i}"  value="${this.currentPath.waypoints[i].y.toFixed(2)}">
                        <label class="unit">in</label>

                        <label>θ:</label>
                        <input type="number" class="waypoint-coordinate" id="theta-${i}" name="theta" value="${this.currentPath.waypoints[i].theta.toFixed(2)}">
                        <label class="unit">deg</label>

                    </div>
                    <button onclick='document.getElementById("other-${i}").style.display = "block";'>More</button>
                    <div id="other-${i}" style="display: none;">

                    <div class="other">
                        <label>Max Vel:</label>
                        <input type="number" class="waypoint-vel" id="maxVelocity-${i}" value="${this.currentPath.waypoints[i].maxVelocity}">
                        <label class="unit">in/s</label>
                    </div>

                    <div class="other">
                        <label>Accel:</label>
                        <input type="number" class="waypoint-vel" id="maxAcceleration-${i}"value="${this.currentPath.waypoints[i].maxAcceleration}">
                        <label class="unit">in/s<sup>2</sup></label>
                    </div>

                    <div class="other">
                        <label>Decel:</label>
                        <input type="number" class="waypoint-vel" id="maxDeceleration-${i}" value="${this.currentPath.waypoints[i].maxDeceleration}">
                        <label class="unit">in/s<sup>2</sup></label>
                    </div>

                    <div class="other">
                        <label>Ending Vel:</label>
                        <input type="number" class="waypoint-vel" id="endingVel-${i}" value="${this.currentPath.waypoints[i].endingVelocity}">
                        <label class="unit">in/s</label>
                    </div>

                    <div class="other">
                        <label>Ending Tolerance:</label>
                        <input type="number" class="waypoint-vel" id="tolerance-${i}" value="${this.currentPath.waypoints[i].tolerance}">
                        <label class="unit">in</label>
                    </div>

                    <button onclick='document.getElementById("other-${i}").style.display = "none";'>Hide</button>
                    </div>
                </div>`
            
            if (this.currentPath.waypoints[i].isPathBreak) {
                html += `
                <div class="path-break">
                    <label>Path Break</label>
                </div>`
            }


            document.getElementById("waypoints").innerHTML += html;
        }
    }

    updateSidebar() {
        for (let i = 0; i < currentPath.waypoints.length; i++) {
            document.getElementById(`x-${i}`).value = this.currentPath.waypoints[i].x.toFixed(2);
            document.getElementById(`y-${i}`).value = this.currentPath.waypoints[i].y.toFixed(2);
            document.getElementById(`theta-${i}`).value = this.currentPath.waypoints[i].theta.toFixed(2);
            document.getElementById(`maxAcceleration-${i}`).value = this.currentPath.waypoints[i].maxAcceleration;
            document.getElementById(`maxDeceleration-${i}`).value = this.currentPath.waypoints[i].maxDeceleration;
            document.getElementById(`maxVelocity-${i}`).value = this.currentPath.waypoints[i].maxVelocity;
            document.getElementById(`endingVel-${i}`).value = this.currentPath.waypoints[i].endingVelocity;
            document.getElementById(`tolerance-${i}`).value = this.currentPath.waypoints[i].tolerance;
        }
    }
}