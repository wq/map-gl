import React, { useMemo, useContext, useRef, useCallback } from "react";
import { MapView, Camera } from "@maplibre/maplibre-react-native";
import { MapContext } from "./MapProvider.js";
import { withWQ } from "@wq/react";
import { useBasemapStyle } from "../hooks.js";
import PropTypes from "prop-types";

function Map({
    name,
    initBounds,
    children,
    containerStyle,
    basemap,
    ...mapProps
}) {
    const { setInstance } = useContext(MapContext),
        fitBounds = useMemo(() => {
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
        mapInstance = useMemo(() => createMapInstance(mapRef, cameraRef), []),
        onInit = useCallback(
            () => setInstance(mapInstance, name),
            [setInstance, mapInstance]
        ),
        onPress = useCallback(
            (e) => {
                if (mapInstance.handlers.click) {
                    mapInstance.handlers.click(e);
                }
            },
            [mapInstance]
        ),
        onMove = useCallback(
            (e) => {
                if (mapInstance.handlers.move) {
                    mapInstance.handlers.move(e);
                }
            },
            [mapInstance]
        );

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

    return (
        <MapView
            ref={mapRef}
            mapStyle={mapStyle}
            rotateEnabled={rotateEnabled}
            pitchEnabled={pitchEnabled}
            attributionEnabled={false}
            logoEnabled={false}
            style={style}
            onPress={onPress}
            onWillStartLoadingMap={onInit}
            onRegionDidChange={onMove}
            {...mapProps}
        >
            <Camera ref={cameraRef} bounds={fitBounds} animationDuration={0} />
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
export function createMapInstance(mapRef, cameraRef) {
    return {
        handlers: {},
        on(event, handler) {
            if (!["click", "move"].includes(event)) {
                console.warn("Unsupported event: " + event);
            }
            this.handlers[event] = handler;
        },
        off(event) {
            delete this.handlers[event];
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
    };
}
