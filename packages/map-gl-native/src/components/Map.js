import React, { useMemo, useContext, useRef, useState, useEffect } from "react";
import { MapView, Camera } from "@maplibre/maplibre-react-native";
import { withWQ } from "@wq/react";
import { MapContext, useBasemapStyle } from "../hooks.js";
import PropTypes from "prop-types";

function Map({ initBounds, children, containerStyle, basemap, ...mapProps }) {
    const { setInstance } = useContext(MapContext),
        fitBounds = useMemo(() => {
            if (!initBounds) {
                return null;
            }
            const [[xmin, ymin], [xmax, ymax]] = initBounds;
            return { sw: [xmin, ymin], ne: [xmax, ymax] };
        }, [initBounds]),
        mapStyle = useBasemapStyle(basemap),
        style = useMemo(() => {
            return {
                flex: 1,
                minHeight: 200,
                ...containerStyle,
            };
        }, [containerStyle]);

    const mapRef = useRef(),
        cameraRef = useRef(),
        [cameraProps, setCameraProps] = useState({}),
        mapInstance = useMemo(
            () => createMapInstance(mapRef, cameraRef, setCameraProps),
            []
        ),
        { handleClick, handleMove } = mapInstance;

    let rotateEnabled, pitchEnabled;
    if (mapProps.rotateEnabled !== undefined) {
        rotateEnabled = mapProps.rotateEnabled;
    } else if (mapProps.dragRotate !== undefined) {
        rotateEnabled = mapProps.dragRotate;
    } else {
        rotateEnabled = false;
    }
    if (mapProps.pitchEnabled !== undefined) {
        pitchEnabled = mapProps.pitchEnabled;
    } else if (mapProps.pitchWithRotate !== undefined) {
        pitchEnabled = mapProps.pitchWithRotate;
    } else {
        pitchEnabled = rotateEnabled;
    }

    useEffect(() => {
        setInstance(mapInstance);
        return () => setInstance(null);
    }, [mapRef.current]);

    return (
        <MapView
            ref={mapRef}
            mapStyle={mapStyle}
            rotateEnabled={rotateEnabled}
            pitchEnabled={pitchEnabled}
            attributionEnabled={false}
            logoEnabled={false}
            style={style}
            onPress={handleClick}
            onRegionDidChange={handleMove}
            {...mapProps}
        >
            <Camera
                ref={cameraRef}
                defaultSettings={{
                    bounds: fitBounds,
                }}
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
export function createMapInstance(mapRef, cameraRef, setCameraProps) {
    const instance = {
        handlers: {
            click: [],
            move: [],
        },
        on(event, handler) {
            if (!(event in this.handlers)) {
                console.warn("Unsupported event: " + event);
            }
            this.handlers[event].push(handler);
        },
        off(event, handler) {
            if (!(event in this.handlers)) {
                console.warn("Unsupported event: " + event);
            }
            this.handlers[event] = this.handlers[event].filter(
                (h) => h !== handler
            );
        },
        _runHandlers(event, e) {
            for (const handler of this.handlers[event]) {
                handler(e);
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
            return this.getMap()?.getVisibleBounds();
        },
        fitBounds(bounds, { padding = 0, duration = 300 }) {
            this.getCamera()?.fitBounds(
                bounds[0],
                bounds[1],
                padding,
                duration
            );
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
