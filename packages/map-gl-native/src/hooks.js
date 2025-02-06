import { useContext } from "react";
import { MapContext } from "./components/MapProvider.js";
import { createMapInstance } from "./components/Map.js";
import * as Location from "expo-location";

export { createMapInstance };

export function useMapInstance() {
    const { instance } = useContext(MapContext) || {};
    return instance;
}

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
                convertOptions(options)
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

export function useBasemapStyle(basemap) {
    if (!basemap) {
        return null;
    } else if (basemap.type === "vector-tile") {
        return basemap.style || basemap.url;
    } else if (basemap.type !== "tile") {
        console.warn(`Unsupported basemap type: ${basemap.type}`);
        return null;
    } else {
        const urls = [];
        if (basemap.url.match("{s}")) {
            (basemap.subdomains || ["a", "b", "c"]).forEach((s) =>
                urls.push(basemap.url.replace("{s}", s))
            );
        } else {
            urls.push(basemap.url);
        }
        return {
            version: 8,
            sources: {
                [basemap.name]: {
                    type: "raster",
                    tiles: urls,
                    tileSize: basemap.tileSize || 256,
                },
            },
            layers: [
                {
                    id: basemap.name,
                    type: "raster",
                    source: basemap.name,
                },
            ],
        };
    }
}
