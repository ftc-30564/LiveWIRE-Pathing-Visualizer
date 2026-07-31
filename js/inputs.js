
// inputs
var state = "idle"; // idle, dragging, selecting, selected
var selectedWaypointIndex = null;
var shiftHeld = false;

// adds event listeners to where anytime the inputs on the sidebar get changed, it updates the waypoint array, and redraws waypoints
function addEventListenersToSidebarInputs() {
    for (let i = 0; i < this.currentPath.waypoints.length; i++) {
        document.getElementById(`name-${i}`).addEventListener("input", (event) => {
            this.currentPath.waypoints[i].name = event.target.value;
        })

        document.getElementById(`x-${i}`).addEventListener("input", (event) => {
            this.currentPath.waypoints[i].x = parseFloat(event.target.value);
            this.currentPath.updateWaypointChain();
            this.renderer.redrawEverything();
        });
        document.getElementById(`y-${i}`).addEventListener("input", (event) => {
            this.currentPath.waypoints[i].y = parseFloat(event.target.value);
            this.currentPath.updateWaypointChain();
            this.renderer.redrawEverything();
        });
        document.getElementById(`theta-${i}`).addEventListener("input", (event) => {
            this.currentPath.waypoints[i].theta = parseFloat(event.target.value);
            this.currentPath.updateWaypointChain();
            this.renderer.redrawEverything();
        });

        document.getElementById(`maxVelocity-${i}`).addEventListener("input", (event) => {
            this.currentPath.waypoints[i].maxVelocity = parseFloat(event.target.value);
        });
        document.getElementById(`maxAcceleration-${i}`).addEventListener("input", (event) => {
            this.currentPath.waypoints[i].maxAcceleration = parseFloat(event.target.value);
        });
        document.getElementById(`maxDeceleration-${i}`).addEventListener("input", (event) => {
            this.currentPath.waypoints[i].maxDeceleration = parseFloat(event.target.value);
        });
        document.getElementById(`endingVel-${i}`).addEventListener("input", (event) => {
            this.currentPath.waypoints[i].endingVelocity = parseFloat(event.target.value);
        });
        document.getElementById(`tolerance-${i}`).addEventListener("input", (event) => {
            this.currentPath.waypoints[i].tolerance = parseFloat(event.target.value);
        });
    }
}


// MARK: Mouse Inputs
canvas.addEventListener('mousemove', (event) => {
    // Get the bounding rectangle of the canvas
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse coordinates relative to the canvas
    const mouseX = Renderer.convertXPixelsToInches(event.clientX - rect.left);
    const mouseY = Renderer.convertYPixelsToInches(event.clientY - rect.top);

    // if the mouse was clicked down on a waypoint but not moved yet
    if (state === "selecting") {
        state = "dragging";
    }

    // if it's dragging a waypoint
    if (state === "dragging" && currentPath.selectedWaypointIndex != null) {
        currentPath.moveWaypoint(currentPath.selectedWaypointIndex, mouseX, mouseY);
        renderer.redrawEverything();
        sidebar.updateSidebar();
    }
    else {
        // check if the mouse is hovering over any of the waypoints
        // if so, change mouse to pointer
        for (let x = 0; x < currentPath.waypoints.length; x ++) {
            if (Renderer.isWithinSquare(mouseX, mouseY, currentPath.waypoints[x].x, currentPath.waypoints[x].y, WAYPOINT_TOLERANCE)) {
                document.body.style.cursor = 'pointer';
                break;
            }
            if (x === currentPath.waypoints.length - 1) {
                document.body.style.cursor = 'default';
            }
        }
    }
});

canvas.addEventListener('mousedown', (event) => {
    // Get the bounding rectangle of the canvas
    const rect = canvas.getBoundingClientRect();

    // Calculate mouse coordinates relative to the field
    const mouseX = Renderer.convertXPixelsToInches(event.clientX - rect.left);
    const mouseY = Renderer.convertYPixelsToInches(event.clientY - rect.top);

    for (let x = 0; x < currentPath.waypoints.length; x ++) {
        // if the user click is on a waypoint
        if (Renderer.isWithinSquare(mouseX, mouseY, currentPath.waypoints[x].x, currentPath.waypoints[x].y, WAYPOINT_TOLERANCE)) {
            currentPath.selectWaypoint(x);
            state = "selecting";
            break;
        }

        // if the user click isn't on a waypoint
        if (x === currentPath.waypoints.length - 1) {
            if ((state == "idle") && shiftHeld) {
                // create a new waypoint
                currentPath.addWaypoint(new Waypoint(mouseX, mouseY, 0).withName(`Waypoint${currentPath.waypoints.length}`));
                sidebar.initializeSidebar();
                addEventListenersToSidebarInputs();
            }
            currentPath.deselectWaypoint();
            state = "idle";
            break;
        }
    }

    renderer.redrawEverything();
    sidebar.updateSidebar();
});

canvas.addEventListener('mouseup', (event) => {
    if (state === "dragging") {
        currentPath.deselectWaypoint();
        state = "idle";
        renderer.redrawEverything();
    }
    else if (state === "selecting") {
        state = "selected";
    }
    else if (state == "selected") {
        currentPath.deselectWaypoint();
        state = "idle";
    }
});

// MARK: Key Inputs
document.addEventListener('keydown', (event) => {
    if (event.key === 'Delete' || event.key == 'Backspace') {
        if (currentPath.waypoints.length == 1) {
            return;
        }
        if (state == "selected" || state == "selecting") {
            // remove the selected waypoint
            currentPath.removeSelectedWaypoint();
            currentPath.selectWaypoint(currentPath.waypoints.length - 1);
            state = "selected";
            sidebar.initializeSidebar();
            addEventListenersToSidebarInputs();
            animator.resetAnimation();
            renderer.redrawEverything();
        }
    }

    if (event.key == 'Shift') {
        shiftHeld = true;
    }

    if (event.key == 'b') {
        animator.toggleAnimation();
    }

    if (event.key == 'n') {
        animator.stopAnimation();
    }

    if (event.key == 'r') {
        animator.resetAnimation();
    }

    if (event.key == 'j') {
        exporter.toggleJava(currentPath);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key == 'Shift') {
        shiftHeld = false;
    }
})

document.getElementById("add-waypoint").onclick = () => {
    currentPath.addWaypoint(new Waypoint(50, 50, 0).withName(`Waypoint${currentPath.waypoints.length}`));
    sidebar.initializeSidebar();
    addEventListenersToSidebarInputs();
    renderer.redrawEverything();
};

// MARK: Settings
document.getElementById("settings-button").onclick = () => {
    document.getElementById("settings").style.display = "block";
    document.getElementById("main").style.opacity = "80%";
}

document.getElementById("settings-exit").onclick = () => {
    document.getElementById("settings").style.display = "none";
    document.getElementById("main").style.opacity = "100%";
}

const uploadButton = document.getElementById('upload-btn');

// MARK: JSON
uploadButton.addEventListener('click', async () => {
    try {
        const jsonData = await window.electronAPI.selectAndReadJson();
    
        if (jsonData) {

            try {
                this.currentPath.waypoints = [];

                // alert(jsonData.waypoints[0].x);


                jsonData.waypoints.forEach(element => {

                    currentPath.addWaypoint(Waypoint.fromJson(element));
                });
                sidebar.initializeSidebar();
                addEventListenersToSidebarInputs();
                renderer.redrawEverything();

                alert("Successfully loaded JSON");
            }
            catch (error) {
                alert("Unable to load, there might be an error of some sorts");
            }
        // Do something with your data here (e.g., update the DOM)
        } 
    } 
    catch (error) {
        alert("Error reading the JSON file. Make sure it is valid JSON format.");
    }
});

const exportButton = document.getElementById('export-btn');

exportButton.addEventListener('click', async () => {

    const response = await window.electronAPI.exportJSON(exporter.exportJson(currentPath));

    if (response.success) {
        alert(`File exported successfully to: ${response.filePath}`);
    } 
    else {
        alert(`Export failed: ${response.error || response.message}`);
    }
});
