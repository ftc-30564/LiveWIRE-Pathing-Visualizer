

const WAYPOINT_TOLERANCE = 3;


class Sidebar {
    constructor(renderer) {
        this.renderer = renderer;
    }

    // clears and writes all the html for the waypoints on the sidebar
    initializeSidebar(path) {
        document.getElementById("waypoints").innerHTML = "";

        for (let i = 0; i < path.waypoints.length; i++) {
            let html = "";

            html = `
                    <div class="waypoint" id="waypoint-${i}">
                    <input type="text" class="waypoint-name" id="name-${i}" value="${path.waypoints[i].name}"></input>
                    <div class="coordinates">
                        <label>X:</label>
                        <input type="number" class="waypoint-coordinate" id="x-${i}" value="${path.waypoints[i].x.toFixed(2)}">
                        <label class="unit">in</label>

                        <label>Y:</label>
                        <input type="number" class="waypoint-coordinate" id="y-${i}"  value="${path.waypoints[i].y.toFixed(2)}">
                        <label class="unit">in</label>

                        <label>θ:</label>
                        <input type="number" class="waypoint-coordinate" id="theta-${i}" name="theta" value="${path.waypoints[i].theta.toFixed(2)}">
                        <label class="unit">deg</label>

                    </div>
                    <button onclick='document.getElementById("other-${i}").style.display = "block";'>More</button>
                    <div id="other-${i}" style="display: none;">`

                    // don't show max velocity for last waypoint, since it is always 0
                    if (i != path.waypoints.length-1) {
                        html += `<div class="other">
                        <label>Max Vel:</label>
                        <input type="number" class="waypoint-vel" id="maxVelocity-${i}" value="${path.waypoints[i].maxVelocity}">
                        <label class="unit">in/s</label>
                        </div>`
                    }

                    // don't show acceleration for last waypoint, since it is always 0
                    if (i != path.waypoints.length-1) {
                        html += `<div class="other">
                        <label>Accel:</label>
                        <input type="number" class="waypoint-vel" id="maxAcceleration-${i}"value="${path.waypoints[i].maxAcceleration}">
                        <label class="unit">in/s<sup>2</sup></label>
                        </div>`
                    }

                    // don't show deceleration for first waypoint, since it is always 0
                    if (i != 0) {
                        html += `<div class="other">
                        <label>Decel:</label>
                        <input type="number" class="waypoint-vel" id="maxDeceleration-${i}" value="${path.waypoints[i].maxDeceleration}">
                        <label class="unit">in/s<sup>2</sup></label>
                        </div>`;
                    }

                    // don't show ending velocity for first and last waypoint, since they are always 0
                    if (i != path.waypoints.length-1 && i != 0) {
                        html += `
                        <div class="other">
                            <label>Ending Vel:</label>
                            <input type="number" class="waypoint-vel" id="endingVel-${i}" value="${path.waypoints[i].endingVelocity}">
                            <label class="unit">in/s</label>
                            <button id="calculate-ending-vel-${i}">Calculate</button>
                        </div>`;
                    }

                    // don't show tolerance for first waypoint, since it is always 0
                    if (i != 0) {
                        html += `<div class="other">
                        <label>Ending Tolerance:</label>
                        <input type="number" class="waypoint-vel" id="tolerance-${i}" value="${path.waypoints[i].tolerance}">
                        <label class="unit">in</label>
                        </div>`;
                    }
                    html += `
                    <button onclick='document.getElementById("other-${i}").style.display = "none";'>Hide</button>
                    </div>
                    </div>`


            document.getElementById("waypoints").innerHTML += html;
        }

        for (let i = 0; i < path.waypoints.length; i++) {
            path.waypoints[i].setSidebarElement(document.getElementById(`waypoint-${i}`));

            document.getElementById("name-" + i).onchange = () => (path.waypoints[i].name = document.getElementById("name-" + i).value);
        }
    }

    updateSidebar(path) {
        for (let i = 0; i < path.waypoints.length; i++) {
            document.getElementById(`x-${i}`).value = path.waypoints[i].x.toFixed(2);
            document.getElementById(`y-${i}`).value = path.waypoints[i].y.toFixed(2);
            document.getElementById(`theta-${i}`).value = path.waypoints[i].theta.toFixed(2);
            document.getElementById(`maxAcceleration-${i}`).value = path.waypoints[i].maxAcceleration;
            document.getElementById(`maxDeceleration-${i}`).value = path.waypoints[i].maxDeceleration;
            document.getElementById(`maxVelocity-${i}`).value = path.waypoints[i].maxVelocity;
            document.getElementById(`endingVel-${i}`).value = path.waypoints[i].endingVelocity;
            document.getElementById(`tolerance-${i}`).value = path.waypoints[i].tolerance;
        }
    }
}