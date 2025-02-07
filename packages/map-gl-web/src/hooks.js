import { useMemo } from "react";
import { useMap } from "react-map-gl/maplibre";

export function useMapInstance(mapId) {
    const maps = useMap();
    return (mapId && maps[mapId]) || maps.current || maps.default;
}

export function useGeolocation() {
    return {
        supported:
            typeof navigator !== "undefined" && "geolocation" in navigator,
        watchPosition(onPosition, onError, options) {
            return navigator.geolocation.watchPosition(
                onPosition,
                onError,
                options
            );
        },
        clearWatch(watchId) {
            return navigator.geolocation.clearWatch(watchId);
        },
    };
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

export function useStyleProp({ name, style, layer, color, icon }) {
    return useMemo(() => {
        if (!style && !layer) {
            console.warn(`Specify style or layer for "${name}"`);
            return { sources: {}, layers: [] };
        }
        if (typeof layer === "string") {
            layer = { id: layer, "source-layer": layer };
        }
        if (style) {
            return style;
        } else if (icon) {
            return {
                sources: {},
                layers: makeSymbolLayers(layer, icon),
            };
        } else if (color) {
            return {
                sources: {},
                layers: makeColorLayers(layer, color),
            };
        } else {
            return {
                sources: {},
                layers: makeColorLayers(layer, "#3388ff", "#3086cc"),
            };
        }
    }, [name, style, layer, color, icon]);
}

function makeSymbolLayers(layer, icon) {
    const { id, ["source-layer"]: sourceLayer, ...rest } = layer;
    return [
        {
            id: id,
            source: "_default",
            "source-layer": sourceLayer || id,
            type: "symbol",
            layout: {
                "icon-image": icon,
                "icon-allow-overlap": true,
            },
            ...rest,
        },
    ];
}

function makeColorLayers(layer, color, pointColor = color) {
    const { id, ["source-layer"]: sourceLayer, ...rest } = layer;
    return [
        {
            id: `${id}-fill`,
            source: "_default",
            "source-layer": sourceLayer || id,
            type: "fill",
            paint: {
                "fill-color": color,
                "fill-opacity": [
                    "match",
                    ["geometry-type"],
                    ["Polygon", "MultiPolygon"],
                    0.2,
                    0,
                ],
            },
            ...rest,
        },
        {
            id: `${id}-line`,
            source: "_default",
            "source-layer": sourceLayer || id,
            type: "line",
            paint: {
                "line-width": 3,
                "line-color": color,
                "line-opacity": 1,
            },
            ...rest,
        },
        {
            id: `${id}-circle`,
            source: "_default",
            "source-layer": sourceLayer || id,
            type: "circle",
            paint: {
                "circle-color": "white",
                "circle-radius": [
                    "match",
                    ["geometry-type"],
                    ["Point", "MultiPoint"],
                    3,
                    0,
                ],
                "circle-stroke-color": pointColor,
                "circle-stroke-width": [
                    "match",
                    ["geometry-type"],
                    ["Point", "MultiPoint"],
                    3,
                    0,
                ],
                "circle-opacity": [
                    "match",
                    ["geometry-type"],
                    ["Point", "MultiPoint"],
                    1,
                    0,
                ],
            },
            ...rest,
        },
    ];
}
