var currentPath;
var paths = [];

var renderer;
var sidebar;
var exporter;
var animator;

async function initialize() {
    await Settings.loadSettings();
    currentPath = new Path("Path1");
    currentPath.selected = true;
    
    paths.push(currentPath);
    paths.push(new Path("testes"));

    renderer = new Renderer(currentPath);
    sidebar = new Sidebar();
    exporter = new Export();
    animator = new Animator(renderer);

    renderer.redrawEverything(currentPath);
    sidebar.initializeSidebar(currentPath);
    animator.resetAnimation(currentPath);

    const event = new Event('initialize');
    window.dispatchEvent(event);
}

initialize();

window.addEventListener("resize", () => {
    renderer.redrawEverything(currentPath);
});