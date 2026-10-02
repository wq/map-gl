import { useMap } from "react-map-gl/maplibre";

export function useMapInstance(mapId) {
    const maps = useMap();
    return (mapId && maps[mapId]) || maps.current || maps.default;
}

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix
export function useGeolocation() {
    return {
        supported:
            typeof navigator !== "undefined" && "geolocation" in navigator,
        watchPosition(onPosition, onError, options) {
            return navigator.geolocation.watchPosition(
                onPosition,
                onError,
                options,
            );
        },
        clearWatch(watchId) {
            return navigator.geolocation.clearWatch(watchId);
        },
    };
}
