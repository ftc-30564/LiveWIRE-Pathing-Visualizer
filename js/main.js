var currentPath;

var renderer;
var sidebar;
var exporter;
var animator;

async function initialize() {
    await Settings.loadSettings();
    currentPath = new Path();

    renderer = new Renderer(currentPath);
    sidebar = new Sidebar(currentPath);
    exporter = new Export();
    animator = new Animator(renderer);

    renderer.redrawEverything();
    sidebar.initializeSidebar();
    

    const event = new Event('initialize');
    window.dispatchEvent(event);
}

initialize();

window.addEventListener("resize", () => {
    renderer.redrawEverything();
});