

const WAYPOINT_TOLERANCE = 3;


class Sidebar {
    constructor(renderer, pathManager) {
        this.renderer = renderer;
        this.pathManager = pathManager;
    }

    // clears and writes all the html for the waypoints on the sidebar
    initializeSidebar() {
        document.getElementById("waypoints").innerHTML = "";

        let path = this.pathManager.currentPath;

        for (let i = 0; i < this.pathManager.currentPath.waypoints.length; i++) {
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

    updateSidebar() {
        let path = this.pathManager.currentPath;
        for (let i = 0; i < path.waypoints.length; i++) {
            document.getElementById(`x-${i}`).value = path.waypoints[i].x.toFixed(2);
            document.getElementById(`y-${i}`).value = path.waypoints[i].y.toFixed(2);
            document.getElementById(`theta-${i}`).value = path.waypoints[i].theta.toFixed(2);

            if (i != path.waypoints.length-1) {
                document.getElementById(`maxVelocity-${i}`).value = path.waypoints[i].maxVelocity;
            }
            if (i != 0) {
                document.getElementById(`maxDeceleration-${i}`).value = path.waypoints[i].maxDeceleration;
            }
            if (i != path.waypoints.length-1) {
                document.getElementById(`maxAcceleration-${i}`).value = path.waypoints[i].maxAcceleration;
            }
            if (i != 0 && i != path.waypoints.length-1) {
                document.getElementById(`endingVel-${i}`).value = path.waypoints[i].endingVelocity;
            }
            if (i != 0) {
                document.getElementById(`tolerance-${i}`).value = path.waypoints[i].tolerance;
            }
        }
    }

    // adds event listeners to where anytime the inputs on the sidebar get changed, it updates the waypoint array, and redraws waypoints
    addEventListenersToSidebarInputs() {
        let path = this.pathManager.currentPath;
        for (let i = 0; i < path.waypoints.length; i++) {
            document.getElementById(`name-${i}`).addEventListener("input", (event) => {
                path.waypoints[i].name = event.target.value;
            })

            document.getElementById(`x-${i}`).addEventListener("input", (event) => {
                path.waypoints[i].x = parseFloat(event.target.value);
                path.updateWaypointChain();
                this.renderer.redrawEverything();
            });
            document.getElementById(`y-${i}`).addEventListener("input", (event) => {
                path.waypoints[i].y = parseFloat(event.target.value);
                path.updateWaypointChain();
                this.renderer.redrawEverything();
            });
            document.getElementById(`theta-${i}`).addEventListener("input", (event) => {
                path.waypoints[i].theta = parseFloat(event.target.value);
                path.updateWaypointChain();
                this.renderer.redrawEverything();
            });

            if (i != path.waypoints.length-1) {
                document.getElementById(`maxVelocity-${i}`).addEventListener("input", (event) => {
                    path.waypoints[i].maxVelocity = parseFloat(event.target.value);
                });
            }

            if (i != path.waypoints.length-1) {
                document.getElementById(`maxAcceleration-${i}`).addEventListener("input", (event) => {
                    path.waypoints[i].maxAcceleration = parseFloat(event.target.value);
                });
            }

            if (i != 0) {
                document.getElementById(`maxDeceleration-${i}`).addEventListener("input", (event) => {
                    path.waypoints[i].maxDeceleration = parseFloat(event.target.value);
                });
            }

            if (i != path.waypoints.length-1 && i != 0) {
                document.getElementById(`endingVel-${i}`).addEventListener("input", (event) => {
                    path.waypoints[i].endingVelocity = parseFloat(event.target.value);
                });

                document.getElementById(`calculate-ending-vel-${i}`).addEventListener("click", (event) => {
                    path.updateWaypointEndingVelocity(i);
                    this.updateSidebar();
                });
            }

            if (i != 0) {
                document.getElementById(`tolerance-${i}`).addEventListener("input", (event) => {
                    path.waypoints[i].tolerance = parseFloat(event.target.value);
                });
            }

            // document.getElementById(`link-${i}`).addEventListener("click", (event) => {
            //     if (path.selectedWaypointIndex != null && path.selectedWaypointIndex != i) {
            //         path.waypoints[path.selectedWaypointIndex].x -= path.waypoints[i].x;
            //         path.waypoints[path.selectedWaypointIndex].y -= path.waypoints[i].y;
            //         path.waypoints[path.selectedWaypointIndex].theta -= path.waypoints[i].theta;

            //         path.waypoints[path.selectedWaypointIndex].linkTo(path.waypoints[i]);

            //         renderer.redrawEverything(path);
            //         sidebar.updateSidebar(path);
            //     }
            // });
        }
    }
}