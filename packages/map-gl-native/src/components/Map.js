import { useMemo, useContext, useRef, useState, useEffect } from "react";
import { Map as MapView, Camera } from "@maplibre/maplibre-react-native";
import { withWQ } from "@wq/react";
import { useBasemapStyle } from "@wq/map";
import { MapContext } from "../hooks.js";
import PropTypes from "prop-types";

function Map({
    // name,
    // mapId,
    basemap,
    initialViewState: initialViewStateProp,
    children,
    style,
    minZoom,
    maxZoom,
    maxBounds,
    ...mapProps
}) {
    const { setInstance, layers } = useContext(MapContext),
        mapStyle = useBasemapStyle(basemap),
        containerStyle = useMemo(() => {
            return {
                flex: 1,
                minHeight: 200,
                ...style,
            };
        }, [style]);

    const mapRef = useRef(),
        cameraRef = useRef(),
        layersRef = useRef(layers),
        [cameraProps, setCameraProps] = useState({}),
        mapInstance = useMemo(
            () =>
                createMapInstance(mapRef, cameraRef, layersRef, setCameraProps),
            [],
        ),
        { handleClick, handleMove } = mapInstance,
        initialViewState = useMemo(() => {
            const { latitude, longitude, bounds, ...rest } =
                initialViewStateProp || {};
            if (latitude !== undefined && longitude !== undefined) {
                return {
                    ...rest,
                    center: [longitude, latitude],
                };
            } else if (Array.isArray(bounds) && bounds.length === 2) {
                const [[west, south], [east, north]] = bounds;
                return {
                    ...rest,
                    bounds: [west, south, east, north],
                };
            } else {
                return initialViewStateProp;
            }
        }, [initialViewStateProp]);

    useEffect(() => {
        setInstance(mapInstance);
        return () => setInstance(null);
    }, [mapInstance, setInstance]);

    useEffect(() => {
        if (layersRef.current !== layers) {
            layersRef.current = layers;
        }
    }, [layers]);

    return (
        <MapView
            ref={mapRef}
            mapStyle={mapStyle}
            attribution={false}
            logo={false}
            style={containerStyle}
            onPress={handleClick}
            onRegionDidChange={handleMove}
            {...mapProps}
        >
            <Camera
                ref={cameraRef}
                initialViewState={initialViewState}
                minZoom={minZoom}
                maxZoom={maxZoom}
                maxBounds={maxBounds}
                {...cameraProps}
            />
            {children}
        </MapView>
    );
}

Map.propTypes = {
    name: PropTypes.string,
    initBounds: PropTypes.array,
    children: PropTypes.node,
    containerStyle: PropTypes.object,
    basemap: PropTypes.object,
};

export default withWQ(Map);

// Mimic some functions from maplibre-gl-js & react-map-gl
export function createMapInstance(
    mapRef,
    cameraRef,
    layersRef,
    setCameraProps,
) {
    const instance = {
        handlers: {
            click: [],
            move: [],
            mousemove: [], // Not supported, but included for MapIdentify
        },
        touchTolerance: 10,
        on(event, handler) {
            if (!(event in this.handlers)) {
                console.warn("Unsupported event: " + event);
                return;
            }
            this.handlers[event].push(handler);
        },
        off(event, handler) {
            if (!(event in this.handlers)) {
                console.warn("Unsupported event: " + event);
                return;
            }
            this.handlers[event] = this.handlers[event].filter(
                (h) => h !== handler,
            );
        },
        _runHandlers(event, e) {
            for (const handler of this.handlers[event]) {
                handler(e.nativeEvent);
            }
        },
        handleClick(e) {
            this._runHandlers("click", e);
        },
        handleMove(e) {
            this._runHandlers("move", e);
        },
        flyTo({ center, zoom }) {
            this.getCamera()?.flyTo(center, zoom);
        },
        getBounds() {
            return this.getMap()?.getBounds();
        },
        fitBounds(bounds, options) {
            if (Array.isArray(bounds) && bounds.length === 2) {
                const [[west, south], [east, north]] = bounds;
                bounds = [west, south, east, north];
            }
            this.getCamera()?.fitBounds(bounds, options);
        },
        async queryRenderedFeatures(pointOrOptions, options) {
            let point;
            if (options) {
                point = pointOrOptions;
                if (Array.isArray(point) && point.length === 2) {
                    const [x, y] = point,
                        radius = this.touchTolerance;
                    point = [
                        [x - radius, y - radius],
                        [x + radius, y + radius],
                    ];
                }
            } else {
                options = pointOrOptions;
                point = null;
            }

            const query = (overrides) => {
                const queryOptions = { ...options, ...overrides };
                if (point) {
                    return this.getMap()?.queryRenderedFeatures(
                        point,
                        queryOptions,
                    );
                } else {
                    return this.getMap()?.queryRenderedFeatures(queryOptions);
                }
            };

            const allFeatures = await query();
            if (!options.layers || !allFeatures || !allFeatures.length) {
                return allFeatures || [];
            }
            const features = [];
            for (const layerId of options.layers) {
                const layerFeatures = await query({
                    layers: [layerId],
                });
                if (layerFeatures && layerFeatures.length) {
                    const layer = layersRef.current[layerId] || { id: layerId };
                    features.push(
                        ...layerFeatures.map((feature) => ({
                            ...feature,
                            layer,
                            source: layer.source,
                            sourceLayer: layer["source-layer"],
                        })),
                    );
                }
            }
            return features;
        },
        // eslint-disable-next-line no-unused-vars
        async querySourceFeatures(sourceId, options) {
            // FIXME - will need to collect Source refs to support this
            return [];
        },
        getMap() {
            return mapRef.current;
        },
        getCamera() {
            return cameraRef.current;
        },
        setCameraProps,
    };

    instance.handleClick = instance.handleClick.bind(instance);
    instance.handleMove = instance.handleMove.bind(instance);

    return instance;
}
