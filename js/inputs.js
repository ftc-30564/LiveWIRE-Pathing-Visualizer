
// inputs
var state = "idle"; // idle, dragging, selecting, selected
var selectedWaypointIndex = null;
var shiftHeld = false;

function updatePathButtons() {
    document.getElementById("paths").innerHTML = '';
    for (let i = 0; i < pathManager.paths.length; i++) {
        let pathDiv = document.createElement("div");
        pathDiv.className = "path-button-container" + (pathManager.paths[i].selected ? " selected" : "");

        if (pathManager.paths[i].selected) {
            pathManager.paths[i].isVisible = true;
        }

        let pathButton = document.createElement("button");
        pathButton.className = "path-name" + (pathManager.paths[i].selected ? " selected" : "");
        pathButton.id = `path-button-${i}`;
        pathButton.innerText = pathManager.paths[i].name;
        pathButton.onclick = () => setNewPath(i);
        pathDiv.appendChild(pathButton);

        let isVisibleCheckbox = document.createElement("input");
        isVisibleCheckbox.className = "path-visible-checkbox";
        isVisibleCheckbox.type = "checkbox";
        isVisibleCheckbox.checked = pathManager.paths[i].isVisible;
        
        isVisibleCheckbox.onchange = () => {
            pathManager.paths[i].isVisible = isVisibleCheckbox.checked;
            renderer.redrawEverything();
        };
        pathDiv.appendChild(isVisibleCheckbox);

        document.getElementById("paths").appendChild(pathDiv);
    }

    let addPathButton = document.createElement("button");
    addPathButton.className = "path-name";
    addPathButton.id = "add-path-button";
    addPathButton.innerText = "+";
    addPathButton.onclick = () => {
        pathManager.addPath();
        renderer.redrawEverything();
        sidebar.initializeSidebar();
        sidebar.addEventListenersToSidebarInputs();
        sidebar.updateSidebar();
        animator.resetAnimation();
        updatePathButtons();
    }

    document.getElementById("paths").appendChild(addPathButton);

    document.getElementById("path-input").value = pathManager.currentPath.name;
    document.getElementById("path-input").onchange = () => {
        pathManager.currentPath.name = document.getElementById("path-input").value;
        updatePathButtons();
    }
}

function setNewPath(index) {
    pathManager.setNewPath(index);
    renderer.redrawEverything();
    sidebar.initializeSidebar();
    sidebar.addEventListenersToSidebarInputs();
    sidebar.updateSidebar();
    animator.resetAnimation();
    updatePathButtons();
}

window.addEventListener('initialize', () => {
    sidebar.addEventListenersToSidebarInputs();
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
    if (state === "dragging" && pathManager.currentPath.selectedWaypointIndex != null) {
        pathManager.currentPath.moveWaypoint(pathManager.currentPath.selectedWaypointIndex, mouseX, mouseY);
        renderer.redrawEverything();
        sidebar.updateSidebar();
        animator.resetAnimation();
    }
    else {
        // check if the mouse is hovering over any of the waypoints
        // if so, change mouse to pointer
        for (let x = 0; x < pathManager.currentPath.waypoints.length; x ++) {
            if (Renderer.isWithinSquare(mouseX, mouseY, pathManager.currentPath.waypoints[x].getAbsoluteWaypoint().x, pathManager.currentPath.waypoints[x].getAbsoluteWaypoint().y, WAYPOINT_TOLERANCE)) {
                document.body.style.cursor = 'pointer';
                break;
            }
            if (x === pathManager.currentPath.waypoints.length - 1) {
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

    for (let x = 0; x < pathManager.currentPath.waypoints.length; x ++) {
        // if the user click is on a waypoint
        if (Renderer.isWithinSquare(mouseX, mouseY, pathManager.currentPath.waypoints[x].getAbsoluteWaypoint().x, pathManager.currentPath.waypoints[x].getAbsoluteWaypoint().y, WAYPOINT_TOLERANCE)) {
            pathManager.currentPath.selectWaypoint(x);
            state = "selecting";
            break;
        }

        // if the user click isn't on a waypoint
        if (x === pathManager.currentPath.waypoints.length - 1) {
            if ((state == "idle") && shiftHeld) {
                // create a new waypoint
                pathManager.currentPath.addWaypoint(new Waypoint(mouseX, mouseY, 0).withName(`way${pathManager.currentPath.waypoints.length}`));
                sidebar.initializeSidebar();
                sidebar.addEventListenersToSidebarInputs();
            }
            pathManager.currentPath.deselectWaypoint();
            state = "idle";
            break;
        }
    }

    renderer.redrawEverything();
    sidebar.updateSidebar();
});

canvas.addEventListener('mouseup', (event) => {
    if (state === "dragging") {
        pathManager.currentPath.deselectWaypoint();
        state = "idle";
        renderer.redrawEverything();
    }
    else if (state === "selecting") {
        state = "selected";
    }
    else if (state == "selected") {
        pathManager.currentPath.deselectWaypoint();
        state = "idle";
    }
});

// MARK: Key Inputs
document.addEventListener('keydown', (event) => {
    if (event.key === 'Delete' || event.key == 'Backspace') {
        if (pathManager.currentPath.waypoints.length == 1) {
            return;
        }
        if (state == "selected" || state == "selecting") {
            // remove the selected waypoint
            pathManager.currentPath.removeSelectedWaypoint();
            pathManager.currentPath.selectWaypoint(pathManager.currentPath.waypoints.length - 1);
            state = "selected";
            sidebar.initializeSidebar();
            sidebar.addEventListenersToSidebarInputs();
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

    // if (event.key == 'n') {
    //     animator.stopAnimation();
    // }

    // if (event.key == 'r') {
    //     animator.resetAnimation();
    // }

    if (event.key == 'j') {
        exporter.toggleJava(pathManager.currentPath);
    }

    if (event.key == 'ArrowRight') {
        pathManager.currentPath.rotateSelectedWaypoint(-1);
        sidebar.updateSidebar();
        renderer.redrawEverything();
    }
    if (event.key == 'ArrowLeft') {
        pathManager.currentPath.rotateSelectedWaypoint(1);
        sidebar.updateSidebar();
        renderer.redrawEverything();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key == 'Shift') {
        shiftHeld = false;
    }
})

document.getElementById("add-waypoint").onclick = () => {
    pathManager.currentPath.addWaypoint(new Waypoint(50, 50, 0).withName(`way${pathManager.currentPath.waypoints.length}`));
    sidebar.initializeSidebar();
    sidebar.addEventListenersToSidebarInputs();
    renderer.redrawEverything();
};

// document.getElementById("add-path-break").onclick = () => {
//     pathManager.currentPath.waypoints[pathManager.currentPath.waypoints.length - 1].isPathBreak = true;
//     pathManager.currentPath.waypoints[pathManager.currentPath.waypoints.length - 1].endingVelocity = 0;
//     pathManager.currentPath.addWaypoint(new Waypoint(50, 50, 0).withName(`way${pathManager.currentPath.waypoints.length}`));
    
//     sidebar.initializeSidebar();
//     sidebar.addEventListenersToSidebarInputs();
//     renderer.redrawEverything(paths);
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

const checkForRobotButton = document.getElementById('check-devices-btn');
checkForRobotButton.addEventListener('click', async () => {
    const response = await window.electronAPI.checkAdb();

    alert(response.message);
})

setInterval(async () => {
    const response = await window.electronAPI.checkAdb();

    if (response.success) {
        document.getElementById("robot-connect-status").innerText = "CONNECTED";
        document.getElementById("robot-connect-status").style.color = "green";
    }
    else {
        document.getElementById("robot-connect-status").innerText = "NOT CONNECTED";
        document.getElementById("robot-connect-status").style.color = "red";
    }
}, 1000)

const loadFromRobotButton = document.getElementById('load-robot-btn');
loadFromRobotButton.addEventListener('click', async () => {
    const response = await window.electronAPI.listPathsOnRobot();

    if (response.success) {
        alert(response.paths);

        pathManager.clearPaths();
        response.paths.forEach(async name => {
            const pathResponse = await window.electronAPI.loadPathOnRobot(name);
            if (pathResponse.success) {
                alert("Successfully loaded path " + name);
                pathManager.addPathFromJson(pathResponse.data);
            }
            else {
                alert("ERROR while loading path " + name);
            }
        });

        setNewPath(0);
        updatePathButtons();
    }
    else {
        alert(response.message);
    }
});

const uploadButton = document.getElementById('upload-btn');

// MARK: JSON
uploadButton.addEventListener('click', async () => {
    try {
        const jsonData = await window.electronAPI.selectAndReadJson();
    
        if (jsonData) {

            try {
                pathManager.currentPath.waypoints = [];

                // alert(jsonData.waypoints[0].x);


                jsonData.waypoints.forEach(element => {

                    pathManager.currentPath.addWaypoint(Waypoint.fromJson(element));
                });
                pathManager.currentPath.name = jsonData.name;
                updatePathButtons();
                sidebar.initializeSidebar();
                sidebar.addEventListenersToSidebarInputs();
                renderer.redrawEverything();

                alert("Successfully loaded JSON");
            }
            catch (error) {
                alert("Unable to load, there might be an error of some sorts");
                alert(error);
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

    const response = await window.electronAPI.exportJSON(pathManager.currentPath.name, exporter.exportJson(pathManager.currentPath));

    if (response.success) {
        alert(`File exported successfully to: ${response.filePath}`);
    } 
    else {
        alert(`Export failed: ${response.error || response.message}`);
    }
});

const pushToRobotButton = document.getElementById('push-robot-btn');

pushToRobotButton.addEventListener('click', async () => {
    const response = await window.electronAPI.sendPathToRobot(pathManager.currentPath.name, exporter.exportJson(pathManager.currentPath));

    alert(response.message);
});

// MARK: Timeline

let dragging = false;

document.getElementById('timeline').addEventListener('mousedown', (event) => {
    pathManager.currentPath.computeTimeSegments();

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

        const time = percent * pathManager.currentPath.totalAnimationTime;

        animator.stopAnimation();

        renderer.robotDistance = pathManager.currentPath.getDistanceAlongPath(time);
        renderer.redrawEverything();

        animator.stopAnimation();

        document.getElementById('timeline-handle').style.left = `${percent * 100}%`;
        document.getElementById('timeline-progress').style.width = `${percent * 100}%`;
    }
});

document.addEventListener('mouseup', (event) => {
    dragging = false;
});
