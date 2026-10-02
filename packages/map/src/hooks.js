import {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useReducer,
} from "react";
import reducer, { actions, initializeState } from "./reducer.js";

export function useRootMapReducer(
    {
        basemaps,
        overlays,
        initialViewState,
        tiles,
        activeOverlays,
        activeBasemap,
    },
    onChangeBasemap,
    onChangeOverlays,
) {
    const [state, dispatch] = useReducer(
        (state, action) => reducer(state, action),
        {
            basemaps: basemaps || [],
            overlays: overlays || [],
            initialViewState,
            tiles,
            activeOverlays,
            activeBasemap,
        },
        initializeState,
    );
    const boundActions = useMemo(() => {
        const boundActions = {};
        for (const [key, action] of Object.entries(actions)) {
            boundActions[key] = (...args) => dispatch(action(...args));
        }
        return boundActions;
    }, [dispatch]);

    useEffect(() => {
        if (onChangeBasemap) {
            onChangeBasemap(state.activeBasemap);
        }
    }, [onChangeBasemap, state.activeBasemap]);

    useEffect(() => {
        if (onChangeOverlays) {
            onChangeOverlays(state.activeOverlays);
        }
    }, [onChangeOverlays, state.activeOverlays]);

    useEffect(() => {
        if (activeBasemap && activeBasemap !== state.activeBasemap) {
            boundActions.setBasemap(activeBasemap);
        }
    }, [boundActions, activeBasemap, state.activeBasemap]);

    useEffect(() => {
        if (activeOverlays && activeOverlays !== state.activeOverlays) {
            for (const name of activeOverlays) {
                if (!state.activeOverlays.includes(name)) {
                    boundActions.showOverlay(name);
                }
            }
            for (const name of state.activeOverlays) {
                if (!activeOverlays.includes(name)) {
                    boundActions.hideOverlay(name);
                }
            }
        }
    }, [boundActions, activeOverlays, state.activeOverlays]);

    return [state, boundActions];
}

const MapReducerContext = createContext();

export function MapReducerProvider({ children, state, actions }) {
    return (
        <MapReducerContext.Provider value={[state, actions]}>
            {children}
        </MapReducerContext.Provider>
    );
}

export function useMapReducer() {
    return useContext(MapReducerContext);
}

export function contextFeatureCollection(context, fieldName) {
    return {
        type: "FeatureCollection",
        features: ((context && context.list) || [])
            .map((obj) => {
                return contextFeature(obj, fieldName);
            })
            .filter((obj) => !!obj),
    };
}

export function contextFeature(context, fieldName) {
    const geometry = contextGeometry(context, fieldName);
    if (!geometry) {
        return null;
    }
    return {
        type: "Feature",
        id: context.id,
        geometry,
        properties: {
            ...context,
        },
    };
}

function contextGeometry(context, fieldName) {
    const [prefix, ...rest] = fieldName.split(".");
    if (!context) {
        return null;
    } else if (prefix.endsWith("[]")) {
        const list = context[prefix.slice(0, prefix.length - 2)];
        if (Array.isArray(list)) {
            return {
                type: "GeometryCollection",
                geometries: list.map((row) =>
                    contextGeometry(row, rest.join(".")),
                ),
            };
        } else {
            return null;
        }
    } else {
        const obj = context[prefix];
        if (rest.length) {
            return contextGeometry(obj, rest.join("."));
        } else if (obj && obj.type && (obj.coordinates || obj.geometries)) {
            return obj;
        } else {
            return null;
        }
    }
}

export function useDataProps(data, context) {
    return useMemo(() => {
        const dataProps = {};
        if (Array.isArray(data)) {
            const [dataType, fieldName] = data;
            if (dataType === "context_feature_collection") {
                dataProps.data = contextFeatureCollection(context, fieldName);
            } else if (dataType === "context_feature") {
                dataProps.data = contextFeature(context, fieldName) || {
                    type: "Feature",
                    geometry: {
                        type: "GeometryCollection",
                        geometries: [],
                    },
                };
            } else {
                console.error("Unexpected data context array", data);
            }
        } else if (data) {
            dataProps.data = data;
        }
        return dataProps;
    }, [data, context]);
}

const _cache = {};

export function useGeoJSON(url, data) {
    const [geojson, setGeojson] = useState();

    if (url && !(url.indexOf("/") === 0 || url.indexOf("http") === 0)) {
        throw new Error("Invalid URL: " + url);
    }

    useEffect(() => {
        if (data) {
            queueMicrotask(() => setGeojson(data));
            return;
        }
        if (_cache[url]) {
            queueMicrotask(() => setGeojson(_cache[url]));
            return;
        }

        const controller = new AbortController();

        fetch(url, { signal: controller.signal }).then(
            function (data) {
                _cache[url] = data;
                setGeojson(data);
            },
            function () {
                setGeojson(null);
            },
        );
        return () => controller.abort();
    }, [url, data]);

    return geojson;
}

export function useGeometry(value, maxGeometries) {
    return useMemo(() => {
        return asGeometry(value, maxGeometries);
    }, [value, maxGeometries]);
}

export function useFeatureCollection(value) {
    return useMemo(() => {
        return asFeatureCollection(value);
    }, [value]);
}

export function asGeometry(geojson, maxGeometries) {
    var geoms = [];
    if (geojson.type === "FeatureCollection") {
        geojson.features.forEach(function (feature) {
            addGeometry(feature.geometry);
        });
    } else if (geojson.type === "Feature") {
        addGeometry(geojson.geometry);
    } else {
        addGeometry(geojson);
    }

    if (geoms.length == 0) {
        return null;
    } else if (geoms.length == 1) {
        return geoms[0];
    } else if (maxGeometries === 1) {
        return geoms[geoms.length - 1];
    } else if (maxGeometries && geoms.length > maxGeometries) {
        return {
            type: "GeometryCollection",
            geometries: geoms.slice(-maxGeometries),
        };
    } else {
        return {
            type: "GeometryCollection",
            geometries: geoms,
        };
    }

    function addGeometry(geometry) {
        if (geometry.type == "GeometryCollection") {
            geometry.geometries.forEach(addGeometry);
        } else {
            geoms.push(geometry);
        }
    }
}

export function asFeatureCollection(geojson) {
    if (typeof geojson === "string") {
        try {
            geojson = JSON.parse(geojson);
        } catch {
            geojson = null;
        }
    }
    if (!geojson || !geojson.type) {
        return geojson;
    }
    if (geojson.type === "FeatureCollection") {
        return geojson;
    }
    if (geojson.type === "Feature") {
        return {
            type: "FeatureCollection",
            features: [geojson],
        };
    }

    const geometry = asGeometry(geojson);

    if (!geometry) {
        return null;
    }

    let features;
    if (geometry.type === "GeometryCollection") {
        features = geometry.geometries.map((geometry) => ({
            type: "Feature",
            properties: {},
            geometry,
        }));
    } else {
        features = [
            {
                type: "Feature",
                properties: {},
                geometry,
            },
        ];
    }

    return {
        type: "FeatureCollection",
        features,
    };
}

export function useDefaultTileSource(tiles) {
    return useMemo(() => {
        if (!tiles) {
            return null;
        }
        const origin = tiles.startsWith("/") ? window.location.origin : "";
        return {
            name: "Default Tile Source",
            type: "vector-tile",
            style: {
                sources: {
                    _default: {
                        type: "vector",
                        tiles: [origin + tiles],
                    },
                },
                layers: [],
            },
        };
    }, [tiles]);
}

export function useBasemapStyle({
    type,
    url,
    style,
    name,
    tileSize,
    subdomains,
    paint,
    layout,
} = {}) {
    return useMemo(
        () =>
            makeBasemapStyle({
                type,
                url,
                style,
                name,
                tileSize,
                subdomains,
                paint,
                layout,
            }),
        [type, url, style, name, tileSize, subdomains, paint, layout],
    );
}

export function makeBasemapStyle({
    type,
    url,
    style,
    name,
    tileSize,
    subdomains,
    paint,
    layout,
}) {
    if (!type || (!url && !style)) {
        return null;
    }
    if (type !== "vector-tile" && type !== "tile") {
        console.warn(`Unsupported basemap type: ${type}`);
        return null;
    }
    if (type === "vector-tile") {
        return style || url;
    } else {
        if (!url) {
            console.warn(`No URL specified for basemap "${name}"`);
            return null;
        }
        const urls = [];
        if (url.match("{s}")) {
            (subdomains || ["a", "b", "c"]).forEach((s) =>
                urls.push(url.replace("{s}", s)),
            );
        } else {
            urls.push(url);
        }
        return {
            version: 8,
            sources: {
                [name]: {
                    type: "raster",
                    tiles: urls,
                    tileSize: tileSize || 256,
                },
            },
            layers: [
                {
                    id: name,
                    type: "raster",
                    source: name,
                    paint: paint || {},
                    layout: layout || {},
                },
            ],
        };
    }
}

export function useStyleProp({
    name,
    style,
    layer,
    data,
    color,
    icon,
    active,
}) {
    const baseStyle = useMemo(
        () =>
            makeStyleProp({
                name,
                style,
                layer,
                data,
                color,
                icon,
            }),
        [name, style, layer, data, color, icon],
    );
    return useMemo(() => {
        if (active === false || active === true) {
            return {
                sources: baseStyle.sources,
                layers: baseStyle.layers.map((layer) => ({
                    ...layer,
                    layout: {
                        ...(layer.layout || {}),
                        visibility: active ? "visible" : "none",
                    },
                })),
            };
        } else {
            return baseStyle;
        }
    }, [baseStyle, active]);
}

export function makeStyleProp({ name, style, layer, data, color, icon }) {
    if (!style && !layer && !data) {
        console.warn(`Specify style, layer, or data for "${name}"`);
        return { sources: {}, layers: [] };
    }

    // Style already specified, ensure data is set (if applicable)
    if (style) {
        if (layer || color || icon) {
            console.warn(
                `Specified style for ${name} - ignoring layer, color, and icon`,
            );
        }
        let sources = style.sources || {},
            layers = style.layers || [];
        if (data) {
            sources[name] = sources[name] || {
                type: "geojson",
                data: data,
            };
            layers = layers.map((lyr) => ({
                id: name,
                source: name,
                ...lyr,
            }));
        }
        return { sources, layers };
    }

    // Build style from layer/data, color, and icon
    let sources, layerProps;
    if (data) {
        if (layer) {
            console.warn(
                `Both layer and data specified for "${name}", using data.`,
            );
        }
        sources = {
            [name]: {
                type: "geojson",
                data: data,
            },
        };
        layerProps = {
            id: name,
            source: name,
        };
    } else {
        sources = {};
        if (typeof layer === "string") {
            layerProps = {
                id: layer,
                source: "_default",
                "source-layer": layer,
            };
        } else {
            layerProps = {
                source: "_default",
                "source-layer": layer.id,
                ...layer,
            };
        }
    }

    if (icon) {
        if (color) {
            console.warn(
                `Both color and icon specified for "${name}", using icon.`,
            );
        }
        return {
            sources: sources,
            layers: makeSymbolLayers(layerProps, icon),
        };
    } else if (color) {
        return {
            sources,
            layers: makeColorLayers(layerProps, color),
        };
    } else {
        return {
            sources,
            layers: makeColorLayers(layerProps, "#3388ff", "#3086cc"),
        };
    }
}

function makeSymbolLayers(layer, icon) {
    return [
        {
            type: "symbol",
            layout: {
                "icon-image": icon,
                "icon-allow-overlap": true,
            },
            ...layer,
        },
    ];
}

function makeColorLayers(layer, color, pointColor = color) {
    return [
        {
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
            ...layer,
            id: `${layer.id}-fill`,
        },
        {
            type: "line",
            paint: {
                "line-width": 3,
                "line-color": color,
                "line-opacity": 1,
            },
            ...layer,
            id: `${layer.id}-line`,
        },
        {
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
            ...layer,
            id: `${layer.id}-circle`,
        },
    ];
}
