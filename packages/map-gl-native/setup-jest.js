import { NativeModules } from "react-native";

for (const name of ["MLRNModule", "MLRNLocationModule", "MLRNOfflineModule"]) {
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
