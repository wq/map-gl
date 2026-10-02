import { createContext, useContext } from "react";
import * as Location from "expo-location";

export const MapContext = createContext({
    instance: null,
    setInstance() {},
    addLayers() {},
    removeLayers() {},
    layers: {},
});

export function useMapInstance() {
    const { instance } = useContext(MapContext) || {};
    return instance;
}

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix
export function useGeolocation() {
    return {
        supported: true,
        async watchPosition(onPosition, onError, options) {
            Location.installWebGeolocationPolyfill();
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status != "success") {
                onError(new Error("Location permission not granted"));
            }

            return navigator.geolocation.watchPosition(
                onPosition,
                onError,
                convertOptions(options),
            );
        },
        clearWatch(watchId) {
            return navigator.geolocation.clearWatch(watchId);
        },
    };

    function convertOptions(options) {
        if (options.enableHighAccuracy) {
            return {
                accuracy: Location.Accuracy.BestForNavigation,
            };
        } else {
            return {};
        }
    }
}
