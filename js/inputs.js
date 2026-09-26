
// inputs
var state = "idle"; // idle, dragging, selecting, selected
var selectedWaypointIndex = null;
var shiftHeld = false;

// adds event listeners to where anytime the inputs on the sidebar get changed, it updates the waypoint array, and redraws waypoints
function addEventListenersToSidebarInputs(path) {
    for (let i = 0; i < path.waypoints.length; i++) {
        document.getElementById(`name-${i}`).addEventListener("input", (event) => {
            path.waypoints[i].name = event.target.value;
        })

        document.getElementById(`x-${i}`).addEventListener("input", (event) => {
            path.waypoints[i].x = parseFloat(event.target.value);
            path.updateWaypointChain();
            renderer.redrawEverything(path);
        });
        document.getElementById(`y-${i}`).addEventListener("input", (event) => {
            path.waypoints[i].y = parseFloat(event.target.value);
            path.updateWaypointChain();
            renderer.redrawEverything(path);
        });
        document.getElementById(`theta-${i}`).addEventListener("input", (event) => {
            path.waypoints[i].theta = parseFloat(event.target.value);
            path.updateWaypointChain();
            renderer.redrawEverything(path);
        });

        document.getElementById(`maxVelocity-${i}`).addEventListener("input", (event) => {
            path.waypoints[i].maxVelocity = parseFloat(event.target.value);
        });
        document.getElementById(`maxAcceleration-${i}`).addEventListener("input", (event) => {
            path.waypoints[i].maxAcceleration = parseFloat(event.target.value);
        });
        document.getElementById(`maxDeceleration-${i}`).addEventListener("input", (event) => {
            path.waypoints[i].maxDeceleration = parseFloat(event.target.value);
        });
        document.getElementById(`endingVel-${i}`).addEventListener("input", (event) => {
            path.waypoints[i].endingVelocity = parseFloat(event.target.value);
        });
        document.getElementById(`calculate-ending-vel-${i}`).addEventListener("click", (event) => {
            path.updateWaypointEndingVelocity(i);
            sidebar.updateSidebar(path);
        });
        document.getElementById(`tolerance-${i}`).addEventListener("input", (event) => {
            path.waypoints[i].tolerance = parseFloat(event.target.value);
        });

        document.getElementById(`link-${i}`).addEventListener("click", (event) => {
            if (path.selectedWaypointIndex != null && path.selectedWaypointIndex != i) {
                path.waypoints[path.selectedWaypointIndex].x -= path.waypoints[i].x;
                path.waypoints[path.selectedWaypointIndex].y -= path.waypoints[i].y;
                path.waypoints[path.selectedWaypointIndex].theta -= path.waypoints[i].theta;

                path.waypoints[path.selectedWaypointIndex].linkTo(path.waypoints[i]);

                renderer.redrawEverything(path);
                sidebar.updateSidebar(path);
            }
        });
    }
}

function updatePathButtons() {
    document.getElementById("paths").innerHTML = '';
    for (let i = 0; i < paths.length; i++) {
        let pathButton = document.createElement("button");
        pathButton.className = "path-name" + (paths[i].selected ? " selected" : "");
        pathButton.id = `path-button-${i}`;
        pathButton.innerText = paths[i].name;
        pathButton.onclick = () => setNewPath(i);
        document.getElementById("paths").appendChild(pathButton);
    }

    let addPathButton = document.createElement("button");
    addPathButton.className = "path-name";
    addPathButton.id = "add-path-button";
    addPathButton.innerText = "+";
    addPathButton.onclick = () => {
        let newPath = new Path(`Path${paths.length + 1}`);
        paths.push(newPath);
        setNewPath(paths.length - 1);
        updatePathButtons();
    }

    document.getElementById("paths").appendChild(addPathButton);

    document.getElementById("path-input").value = currentPath.name;
    document.getElementById("path-input").onchange = () => {
        currentPath.name = document.getElementById("path-input").value;
        updatePathButtons();
    }
}

function setNewPath(index) {
    currentPath.selected = false;
    currentPath = paths[index];
    paths[index].selected = true;
    renderer.redrawEverything(currentPath);
    sidebar.initializeSidebar(currentPath);
    updatePathButtons();
}

window.addEventListener('initialize', () => {
    addEventListenersToSidebarInputs(currentPath);
    updatePathButtons();
});

// MARK: Mouse Inputs
document.addEventListener('mousemove', (event) => {
    // Get the bounding rectangle of the canvas
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse coordinates relative to the canvas
    let mouseX = Renderer.convertXPixelsToInches(event.clientX - rect.left);
    let mouseY = Renderer.convertYPixelsToInches(event.clientY - rect.top);

    mouseX = Math.min(Math.max(mouseX, 0), FIELD_WIDTH);
    mouseY = Math.min(Math.max(mouseY, 0), FIELD_HEIGHT);

    // if the mouse was clicked down on a waypoint but not moved yet
    if (state === "selecting") {
        state = "dragging";
    }

    // if it's dragging a waypoint
    if (state === "dragging" && currentPath.selectedWaypointIndex != null) {
        currentPath.moveWaypoint(currentPath.selectedWaypointIndex, mouseX, mouseY);
        renderer.redrawEverything(currentPath);
        sidebar.updateSidebar(currentPath);
        animator.resetAnimation(currentPath);
    }
    else {
        // check if the mouse is hovering over any of the waypoints
        // if so, change mouse to pointer
        for (let x = 0; x < currentPath.waypoints.length; x ++) {
            if (Renderer.isWithinSquare(mouseX, mouseY, currentPath.waypoints[x].getAbsoluteWaypoint().x, currentPath.waypoints[x].getAbsoluteWaypoint().y, WAYPOINT_TOLERANCE)) {
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
        if (Renderer.isWithinSquare(mouseX, mouseY, currentPath.waypoints[x].getAbsoluteWaypoint().x, currentPath.waypoints[x].getAbsoluteWaypoint().y, WAYPOINT_TOLERANCE)) {
            currentPath.selectWaypoint(x);
            state = "selecting";
            break;
        }

        // if the user click isn't on a waypoint
        if (x === currentPath.waypoints.length - 1) {
            if ((state == "idle") && shiftHeld) {
                // create a new waypoint
                currentPath.addWaypoint(new Waypoint(mouseX, mouseY, 0).withName(`way${currentPath.waypoints.length}`));
                sidebar.initializeSidebar(currentPath);
                addEventListenersToSidebarInputs(currentPath);
            }
            currentPath.deselectWaypoint();
            state = "idle";
            break;
        }
    }

    renderer.redrawEverything(currentPath);
    sidebar.updateSidebar(currentPath);
});

canvas.addEventListener('mouseup', (event) => {
    if (state === "dragging") {
        currentPath.deselectWaypoint();
        state = "idle";
        renderer.redrawEverything(currentPath);
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
            sidebar.initializeSidebar(currentPath);
            addEventListenersToSidebarInputs(currentPath);
            animator.resetAnimation(currentPath);
            renderer.redrawEverything(currentPath);
        }
    }

    if (event.key == 'Shift') {
        shiftHeld = true;
    }

    if (event.key == 'b') {
        animator.toggleAnimation(currentPath);
    }

    // if (event.key == 'n') {
    //     animator.stopAnimation();
    // }

    // if (event.key == 'r') {
    //     animator.resetAnimation();
    // }

    if (event.key == 'j') {
        exporter.toggleJava(currentPath);
    }

    if (event.key == 'ArrowRight') {
        currentPath.rotateSelectedWaypoint(-1);
        sidebar.updateSidebar(currentPath);
        renderer.redrawEverything(currentPath);
    }
    if (event.key == 'ArrowLeft') {
        currentPath.rotateSelectedWaypoint(1);
        sidebar.updateSidebar(currentPath);
        renderer.redrawEverything(currentPath);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key == 'Shift') {
        shiftHeld = false;
    }
})

document.getElementById("add-waypoint").onclick = () => {
    currentPath.addWaypoint(new Waypoint(50, 50, 0).withName(`way${currentPath.waypoints.length}`));
    sidebar.initializeSidebar(currentPath);
    addEventListenersToSidebarInputs(currentPath);
    renderer.redrawEverything(currentPath);
};

// document.getElementById("add-path-break").onclick = () => {
//     currentPath.waypoints[currentPath.waypoints.length - 1].isPathBreak = true;
//     currentPath.waypoints[currentPath.waypoints.length - 1].endingVelocity = 0;
//     currentPath.addWaypoint(new Waypoint(50, 50, 0).withName(`way${currentPath.waypoints.length}`));
    
//     sidebar.initializeSidebar(currentPath);
//     addEventListenersToSidebarInputs(currentPath);
//     renderer.redrawEverything(currentPath);
// }

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
                currentPath.waypoints = [];

                // alert(jsonData.waypoints[0].x);


                jsonData.waypoints.forEach(element => {

                    currentPath.addWaypoint(Waypoint.fromJson(element));
                });
                currentPath.name = jsonData.name;
                updatePathButtons();
                sidebar.initializeSidebar(currentPath);
                addEventListenersToSidebarInputs(currentPath);
                renderer.redrawEverything(currentPath);

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

const pushToRobotButton = document.getElementById('push-robot-btn');

pushToRobotButton.addEventListener('click', async () => {
    const response = await window.electronAPI.sendPathToRobot(currentPath.name, exporter.exportJson(currentPath));

    alert(response.message);
});

// MARK: Timeline

let dragging = false;

document.getElementById('timeline').addEventListener('mousedown', (event) => {
    currentPath.computeTimeSegments();

    dragging = true;
});


document.addEventListener('mousemove', (event) => {
    if (dragging) {
        // Get the bounding rectangle of the canvas
        const rect = document.getElementById('timeline').getBoundingClientRect();

        // Calculate mouse coordinates relative to the field
        const mouseX = event.clientX - rect.left;

        const clampedMouseX = Math.min(Math.max(mouseX, 0), rect.width);

        let percent = clampedMouseX / rect.width;

        // clamp between 0 and 1
        percent = Math.min(Math.max(percent, 0), 1);

        const time = percent * currentPath.totalAnimationTime;

        animator.stopAnimation();

        renderer.robotDistance = currentPath.getDistanceAlongPath(time);
        renderer.redrawEverything(currentPath);

        animator.stopAnimation();

        document.getElementById('timeline-handle').style.left = `${percent * 100}%`;
        document.getElementById('timeline-progress').style.width = `${percent * 100}%`;
    }
});

document.addEventListener('mouseup', (event) => {
    dragging = false;
});
