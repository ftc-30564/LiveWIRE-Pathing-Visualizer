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

    sidebar.initializeSidebar();
    renderer.redrawEverything();
}

initialize();

window.addEventListener("resize", () => {
    renderer.redrawEverything();
});