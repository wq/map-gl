import { NativeModules } from "react-native";

for (const mod of [
    "Camera",
    "GeoJSONSource",
    "Images",
    "Location",
    "Log",
    "MapView",
    "Network",
    "Offline",
    "StaticMap",
    "TransformRequest",
    "VectorSource",
]) {
    const name = `MLRN${mod}Module`;
    if (!NativeModules[name]) {
        NativeModules[name] = {};
    }
    const module = NativeModules[name];
    if (!module.addListener) {
        module.addListener = jest.fn();
    }
    if (!module.removeListeners) {
        module.removeListeners = jest.fn();
    }
}
