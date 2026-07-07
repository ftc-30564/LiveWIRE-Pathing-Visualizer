const WAYPOINT_TOLERANCE = 3;

var state = "idle"; // idle, dragging, selecting, selected

var selectedWaypoint = null;
var startingWaypoint = null;

var shiftHeld = false;

function initializeSidebar() {
    document.getElementById("waypoints").innerHTML = "";

    for (let i = 0; i < waypoints.length; i++) {
        let html = `
                <div class="waypoint" id="waypoint-${i}">
                <h2>Waypoint ${i}</h2>
                <div class="coordinates">
                    <label>X:</label>
                    <input type="number" class="waypoint-coordinate" id="x-${i}" value="${waypoints[i].x.toFixed(2)}">
                    <label class="unit">in</label>

                    <label>Y:</label>
                    <input type="number" class="waypoint-coordinate" id="y-${i}"  value="${waypoints[i].y.toFixed(2)}">
                    <label class="unit">in</label>

                    <label>θ:</label>
                    <input type="number" class="waypoint-coordinate" id="theta-${i}" name="theta" value="${waypoints[i].theta.toFixed(2)}">
                    <label class="unit">in</label>
                </div>
                <button onclick='document.getElementById("other-${i}").style.display = "block";'>More</button>
                <div id="other-${i}" style="display: none;">

                <div class="other">
                    <label>Max Vel:</label>
                    <input type="number" class="waypoint-vel" id="maxVelocity-${i}" value="${waypoints[i].maxVelocity.toFixed(2)}">
                    <label class="unit">in/s</label>
                </div>

                <div class="other">
                    <label>Accel:</label>
                    <input type="number" class="waypoint-vel" id="maxAcceleration-${i}"value="${waypoints[i].maxAcceleration.toFixed(2)}">
                    <label class="unit">in/s<sup>2</sup></label>
                </div>

                <div class="other">
                    <label>Decel:</label>
                    <input type="number" class="waypoint-vel" id="maxDeceleration-${i}" value="${waypoints[i].maxDeceleration.toFixed(2)}">
                    <label class="unit">in/s<sup>2</sup></label>
                </div>

                <div class="other">
                    <label>Ending Vel:</label>
                    <input type="number" class="waypoint-vel" id="endingVel-${i}" value="${waypoints[i].endingVelocity.toFixed(2)}">
                    <label class="unit">in/s</label>
                </div>

                <div class="other">
                    <label>Ending Tolerance:</label>
                    <input type="number" class="waypoint-vel" id="tolerance-${i}" value="${waypoints[i].tolerance.toFixed(2)}">
                    <label class="unit">in</label>
                </div>

                <button onclick='document.getElementById("other-${i}").style.display = "none";'>Hide</button>
                </div>
            </div>`

        document.getElementById("waypoints").innerHTML += html;
    }

    // adds event listeners to where anytime the inputs get changed, it updates the waypoint array
    for (let i = 0; i < waypoints.length; i++) {
        waypoints[i].setSidebarElement(document.getElementById(`waypoint-${i}`));

        document.getElementById(`x-${i}`).addEventListener("input", (event) => {
            waypoints[i].x = parseFloat(event.target.value);
            updateWaypointChain();
            renderer.redrawEverything();
        });
        document.getElementById(`y-${i}`).addEventListener("input", (event) => {
            waypoints[i].y = parseFloat(event.target.value);
            updateWaypointChain();
            renderer.redrawEverything();
        });
        document.getElementById(`theta-${i}`).addEventListener("input", (event) => {
            waypoints[i].theta = parseFloat(event.target.value);
            updateWaypointChain();
            renderer.redrawEverything();
        });

        document.getElementById(`maxVelocity-${i}`).addEventListener("input", (event) => {
            waypoints[i].maxVelocity = parseFloat(event.target.value);
        });
        document.getElementById(`maxAcceleration-${i}`).addEventListener("input", (event) => {
            waypoints[i].maxAcceleration = parseFloat(event.target.value);
        });
        document.getElementById(`maxDeceleration-${i}`).addEventListener("input", (event) => {
            waypoints[i].maxDeceleration = parseFloat(event.target.value);
        });
        document.getElementById(`endingVel-${i}`).addEventListener("input", (event) => {
            waypoints[i].endingVelocity = parseFloat(event.target.value);
        });
        document.getElementById(`tolerance-${i}`).addEventListener("input", (event) => {
            waypoints[i].tolerance = parseFloat(event.target.value);
        });
    }
}

function updateSidebar() {
    for (let i = 0; i < waypoints.length; i++) {
        document.getElementById(`x-${i}`).value = waypoints[i].x.toFixed(2);
        document.getElementById(`y-${i}`).value = waypoints[i].y.toFixed(2);
        document.getElementById(`theta-${i}`).value = waypoints[i].theta.toFixed(2);
        document.getElementById(`maxAcceleration-${i}`).value = waypoints[i].maxAcceleration.toFixed(2);
        document.getElementById(`maxDeceleration-${i}`).value = waypoints[i].maxDeceleration.toFixed(2);
        document.getElementById(`maxVelocity-${i}`).value = waypoints[i].maxVelocity.toFixed(2);
        document.getElementById(`endingVel-${i}`).value = waypoints[i].endingVelocity.toFixed(2);
        document.getElementById(`tolerance-${i}`).value = waypoints[i].tolerance.toFixed(2);
    }
}

initializeSidebar();

canvas.addEventListener('mousemove', (event) => {
    // Get the bounding rectangle of the canvas
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse coordinates relative to the canvas
    const mouseX = convertXPixelsToInches(event.clientX - rect.left);
    const mouseY = convertYPixelsToInches(event.clientY - rect.top);

    // if the mouse was clicked down on a waypoint but not moved yet
    if (state === "selecting") {
        state = "dragging";
    }

    // if it's dragging a waypoint
    if (state === "dragging" && selectedWaypoint != null) {
        selectedWaypoint.x = mouseX;
        selectedWaypoint.y = mouseY;
        updateWaypointChain();
        renderer.redrawEverything();
        updateSidebar();
    }
    else {
        // check if the mouse is hovering over any of the waypoints
        // if so, change mouse to pointer
        for (let x = 0; x < waypoints.length; x ++) {
            if (isWithinSquare(mouseX, mouseY, waypoints[x].x, waypoints[x].y, WAYPOINT_TOLERANCE)) {
                document.body.style.cursor = 'pointer';
                break;
            }
            if (x === waypoints.length - 1) {
                document.body.style.cursor = 'default';
            }
        }
    }
});

canvas.addEventListener('mousedown', (event) => {
    // Get the bounding rectangle of the canvas
    const rect = canvas.getBoundingClientRect();

    // Calculate mouse coordinates relative to the field
    const mouseX = convertXPixelsToInches(event.clientX - rect.left);
    const mouseY = convertYPixelsToInches(event.clientY - rect.top);

    for (let x = 0; x < waypoints.length; x ++) {
        // if the user click is on a waypoint
        if (isWithinSquare(mouseX, mouseY, waypoints[x].x, waypoints[x].y, WAYPOINT_TOLERANCE)) {
            if (selectedWaypoint != null) {
                selectedWaypoint.setSelected(false);
            }
            selectedWaypoint = waypoints[x];
            selectedWaypoint.setSelected(true);
            startingWaypoint = selectedWaypoint;
            state = "selecting";
            break;
        }

        // if the user click isn't on a waypoint
        if (x === waypoints.length - 1) {
            if ((state == "idle") && shiftHeld) {
                // create a new waypoint
                waypoints.push(new Waypoint(mouseX, mouseY, 0));
                updateWaypointChain();
                initializeSidebar();
            }
            if (selectedWaypoint != null) {
                // reset any selected
                selectedWaypoint.setSelected(false);
            }
            selectedWaypoint = null;
            state = "idle";
            break;
        }
    }

    renderer.redrawEverything();
    updateSidebar();
});

canvas.addEventListener('mouseup', (event) => {
    if (state === "dragging") {
        selectedWaypoint.setSelected(false);
        selectedWaypoint = null;
        state = "idle";
        renderer.redrawEverything();
    }
    else if (state === "selecting") {
        state = "selected";
    }
    else if (state == "selected") {
        selectedWaypoint.setSelected(false);
        selectedWaypoint = null;
        state = "idle";
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Delete' || event.key == 'Backspace') {
        if (waypoints.length == 1) {
            return;
        }
        if (state == "selected" || state == "selecting") {
            // remove the selected waypoint
            waypoints.splice(waypoints.indexOf(selectedWaypoint), 1);
            selectedWaypoint = waypoints[waypoints.length-1];
            selectedWaypoint.setSelected(true);
            state = "selected";
            initializeSidebar();
            updateWaypointChain();
            renderer.redrawEverything();
        }
    }

    if (event.key == 'Shift') {
        shiftHeld = true;
    }

    if (event.key == 'b') {
        toggleAnimation();
        //animationId = requestAnimationFrame(animateRobot(waypoints));
    }

    if (event.key == 'n') {
        stopAnimation();
    }

    if (event.key == 'r') {
        resetAnimation();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key == 'Shift') {
        shiftHeld = false;
    }
})

document.getElementById("add-waypoint").onclick = () => {
    waypoints.push(new Waypoint(50, 50, 0));
    initializeSidebar();
    updateWaypointChain();
    renderer.redrawEverything();
};