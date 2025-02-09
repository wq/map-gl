import { asFeatureCollection } from "./hooks.js";

const MAP_INITIALIZE = "MAP_INITIALIZE",
    MAP_SET_VIEW_STATE = "MAP_SET_VIEWSTATE",
    MAP_SHOW_OVERLAY = "MAP_SHOW_OVERLAY",
    MAP_HIDE_OVERLAY = "MAP_HIDE_OVERLAY",
    MAP_SET_BASEMAP = "MAP_SET_BASEMAP",
    MAP_SET_HIGHLIGHT = "MAP_SET_HIGHLIGHT",
    MAP_ADD_HIGHLIGHT = "MAP_ADD_HIGHLIGHT",
    MAP_TOGGLE_HIGHLIGHT = "MAP_TOGGLE_HIGHLIGHT",
    MAP_REMOVE_HIGHLIGHT = "MAP_REMOVE_HIGHLIGHT",
    MAP_CLEAR_HIGHLIGHT = "MAP_CLEAR_HIGHLIGHT";

const emptyState = {
    basemaps: [],
    overlays: [],
    viewState: null,
    initBounds: undefined,
    tiles: null,
    autoZoom: null,
    highlight: null,
    mapId: null,
    activeBasemap: null,
    activeOverlays: null,
};

export default function reducer(state = emptyState, action) {
    switch (action.type) {
        case MAP_INITIALIZE: {
            const {
                basemaps: initBasemaps,
                overlays: initOverlays,
                viewState,
                initBounds,
                tiles,
                autoZoom,
                highlight,
                mapId,
                activeBasemap,
                activeOverlays,
            } = { ...emptyState, ...action.payload };
            const basemaps = reduceBasemaps([], initBasemaps, activeBasemap),
                overlays = reduceOverlays([], initOverlays, activeOverlays);
            return {
                basemaps,
                overlays,
                viewState,
                initBounds,
                tiles,
                autoZoom,
                highlight,
                mapId,
                activeBasemap: (
                    basemaps.find((b) => b.active) ||
                    basemaps[0] ||
                    {}
                ).name,
                activeOverlays: overlays
                    .filter((o) => o.active)
                    .map((o) => o.name),
            };
        }
        case MAP_SET_VIEW_STATE:
            return { ...state, viewState: action.payload };
        case MAP_SHOW_OVERLAY: {
            const activeOverlays = state.activeOverlays.concat([
                action.payload,
            ]);
            return {
                ...state,
                activeOverlays,
                overlays: reduceOverlays(
                    state.overlays,
                    state.overlays,
                    activeOverlays
                ),
            };
        }
        case MAP_HIDE_OVERLAY: {
            const activeOverlays = state.activeOverlays.filter(
                (o) => o !== action.payload
            );
            return {
                ...state,
                activeOverlays,
                overlays: reduceOverlays(
                    state.overlays,
                    state.overlays,
                    activeOverlays
                ),
            };
        }
        case MAP_SET_BASEMAP:
            return {
                ...state,
                activeBasemap: action.payload,
                basemaps: reduceBasemaps(
                    state.basemaps,
                    state.basemaps,
                    action.payload
                ),
            };
        case MAP_SET_HIGHLIGHT:
            return {
                ...state,
                highlight: action.payload,
            };
        case MAP_ADD_HIGHLIGHT: {
            if (!state.highlight) {
                return { ...state, highlight: action.payload };
            }
            const features = {};
            let hasNew = false;
            state.highlight.features.forEach(
                (feature) => (features[feature.id] = feature)
            );
            action.payload.features.forEach((feature) => {
                if (!features[feature.id]) {
                    hasNew = true;
                    features[feature.id] = feature;
                }
            });
            if (!hasNew) {
                return state;
            }
            return {
                ...state,
                highlight: {
                    type: "FeatureCollection",
                    features: Object.values(features),
                },
            };
        }
        case MAP_TOGGLE_HIGHLIGHT: {
            if (!state.highlight) {
                return { ...state, highlight: action.payload };
            }
            const features = {};
            state.highlight.features.forEach(
                (feature) => (features[feature.id] = feature)
            );

            action.payload.features.forEach((feature) => {
                if (features[feature.id]) {
                    delete features[feature.id];
                } else {
                    features[feature.id] = feature;
                }
            });

            return {
                ...state,
                highlight: checkEmpty({
                    type: "FeatureCollection",
                    features: Object.values(features),
                }),
            };
        }
        case MAP_REMOVE_HIGHLIGHT: {
            if (!state.highlight) {
                return state;
            }
            const remove = {};
            action.payload.features.forEach(
                (feature) => (remove[feature.id] = true)
            );

            return {
                ...state,
                highlight: checkEmpty({
                    type: "FeatureCollection",
                    features: state.highlight.features.filter(
                        (feature) => !remove[feature.id]
                    ),
                }),
            };
        }

        case MAP_CLEAR_HIGHLIGHT:
            if (!state.highlight) {
                return state;
            } else {
                return {
                    ...state,
                    highlight: null,
                };
            }
        default:
            return state;
    }
}

function reduceBasemaps(lastBasemaps, nextBasemaps, activeBasemap) {
    if (!nextBasemaps || nextBasemaps.length === 0) {
        return;
    }
    const basemaps = nextBasemaps.map((basemap) => {
        if (activeBasemap && activeBasemap === basemap.name) {
            return {
                ...basemap,
                active: true,
            };
        } else {
            return {
                ...basemap,
                active: false,
            };
        }
    });
    if (!basemaps.some((basemap) => basemap.active)) {
        basemaps[0].active = true;
    }
    if (sameLayers(basemaps, lastBasemaps)) {
        return lastBasemaps;
    } else {
        return basemaps;
    }
}

function reduceOverlays(lastOverlays, nextOverlays, activeOverlays) {
    if (!nextOverlays || nextOverlays.length === 0) {
        return [];
    }
    const overlays = nextOverlays.map((overlay) => {
        if (activeOverlays && activeOverlays.includes(overlay.name)) {
            return {
                ...overlay,
                active: true,
            };
        } else if (activeOverlays && !activeOverlays.includes(overlay.name)) {
            return {
                ...overlay,
                active: false,
            };
        } else if (overlay.active) {
            return {
                ...overlay,
            };
        } else {
            return {
                ...overlay,
                active: false,
            };
        }
    });
    if (sameLayers(overlays, lastOverlays)) {
        return lastOverlays;
    } else {
        return overlays;
    }
}

function sameLayers(arr1, arr2) {
    if (arr1.length !== (arr2 || []).length) {
        return false;
    }
    return arr1.every(
        (layer, i) =>
            layer.name === arr2[i].name && layer.active === arr2[i].active
    );
}

function checkEmpty(geojson) {
    if (geojson.features.length === 0) {
        return null;
    } else {
        return geojson;
    }
}
export const actions = {
    initialize(initialState) {
        return { type: MAP_INITIALIZE, payload: initialState };
    },
    setViewState(viewState) {
        return { type: MAP_SET_VIEW_STATE, payload: viewState };
    },
    setBasemap(name) {
        return {
            type: MAP_SET_BASEMAP,
            payload: name,
        };
    },
    showOverlay(name) {
        return {
            type: MAP_SHOW_OVERLAY,
            payload: name,
        };
    },
    hideOverlay(name) {
        return {
            type: MAP_HIDE_OVERLAY,
            payload: name,
        };
    },
    setHighlight(geojson) {
        return {
            type: MAP_SET_HIGHLIGHT,
            payload: asFeatureCollection(geojson),
        };
    },
    addHighlight(geojson) {
        return {
            type: MAP_ADD_HIGHLIGHT,
            payload: asFeatureCollection(geojson),
        };
    },
    toggleHighlight(geojson) {
        return {
            type: MAP_TOGGLE_HIGHLIGHT,
            payload: asFeatureCollection(geojson),
        };
    },
    removeHighlight(geojson) {
        return {
            type: MAP_REMOVE_HIGHLIGHT,
            payload: asFeatureCollection(geojson),
        };
    },
    clearHighlight() {
        return {
            type: MAP_CLEAR_HIGHLIGHT,
        };
    },
};
