import * as map from "@wq/map";
import * as mapGlWeb from "@wq/map-gl-web";
import fs from "fs";

const index = [];
index.push("export {");
for (const key in map) {
    index.push(`    ${key},`);
}
index.push('} from "@wq/map";');
index.push("");

index.push("export {");
for (const key in mapGlWeb) {
    index.push(`    ${key},`);
}
index.push('} from "@wq/map-gl-web";');

const src = index.join("\n") + "\n";

console.log("src/index.js");
fs.writeFileSync("src/index.js", src);

console.log("src/index.native.js");
fs.writeFileSync(
    "src/index.native.js",
    src.replace(/@wq\/map-gl-web/g, "@wq/map-gl-native"),
);