const fs = require("fs"),
    path = require("path");

const files = [
        "maplibre-gl-shared.mjs",
        "maplibre-gl-shared.mjs.map",
        "maplibre-gl-worker.mjs",
        "maplibre-gl-worker.mjs.map",
    ],
    nodeModules = path.join(__dirname, "..", "node_modules");

exports.onPreInit = () => {
    for (const file of files) {
        const source = path.join(nodeModules, "maplibre-gl", "dist", file),
            dest = path.join(__dirname, "static", "js", file);
        if (!fs.existsSync(dest)) {
            fs.copyFileSync(source, dest);
        }
    }
};
