var renderer;
var sidebar;
var exporter;
var animator;
var pathManager;

async function initialize() {
    await Settings.loadSettings();

    pathManager = new PathManager();

    pathManager.addPath();

    renderer = new Renderer(pathManager);
    sidebar = new Sidebar(renderer, pathManager);
    exporter = new Export();
    animator = new Animator(renderer, pathManager);

    renderer.redrawEverything();
    sidebar.initializeSidebar();
    animator.resetAnimation();

    const event = new Event('initialize');
    window.dispatchEvent(event);
}

initialize();

window.addEventListener("resize", () => {
    renderer.redrawEverything();
});