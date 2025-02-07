import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useReducer,
} from "react";
import reducer, { actions } from "./reducer.js";

export function useRootMapReducer(
    {
        basemaps,
        overlays,
        initBounds,
        tiles,
        autoZoom,
        activeOverlays,
        activeBasemap,
    },
    onChangeBasemap,
    onChangeOverlays
) {
    const [state, dispatch] = useReducer(
        (state, action) => reducer(state, action),
        {
            basemaps,
            overlays,
            initBounds,
            tiles,
            autoZoom,
            activeOverlays,
            activeBasemap,
        }
    );
    const boundActions = useMemo(() => {
        const boundActions = {};
        for (const [key, action] of Object.entries(actions)) {
            boundActions[key] = (...args) => dispatch(action(...args));
        }
        return boundActions;
    }, [dispatch]);

    useEffect(() => {
        boundActions.initialize({
            basemaps,
            overlays,
            initBounds,
            tiles,
            autoZoom,
            activeOverlays,
            activeBasemap,
        });
    }, [basemaps, overlays, initBounds, tiles, autoZoom]);

    useEffect(() => {
        if (onChangeBasemap) {
            onChangeBasemap(state.activeBasemap);
        }
    }, [state.activeBasemap]);

    useEffect(() => {
        if (onChangeOverlays) {
            onChangeOverlays(state.activeOverlays);
        }
    }, [state.activeOverlays]);

    useEffect(() => {
        if (activeBasemap && activeBasemap !== state.activeBasemap) {
            boundActions.setBasemap(activeBasemap);
        }
    }, [activeBasemap, state.activeBasemap]);

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
    }, [activeOverlays, state.activeOverlays]);

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
                    contextGeometry(row, rest.join("."))
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
            setGeojson(data);
            return;
        }
        if (_cache[url]) {
            setGeojson(_cache[url]);
            return;
        }
        if (url.match(/\/(new)?(\/edit)?\.geojson$/)) {
            // Ignore requests for "new.geojson"
            setGeojson(null);
            return;
        }

        fetch(url).then(
            function (data) {
                _cache[url] = data;
                setGeojson(data);
            },
            function () {
                setGeojson(null);
            }
        );
    }, [url, data]);

    return geojson;
}

export function useGeometry(value, maxGeometries) {
    return useMemo(() => {
        return asGeometry(value, maxGeometries);
    }, [value]);
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
        } catch (e) {
            geojson = null;
        }
    }
    if (!geojson || !geojson.type) {
        return geojson;
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
