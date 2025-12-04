import React, { useCallback, useState, useMemo } from "react";
import { withWQ, useComponents } from "@wq/react";
import PropTypes from "prop-types";
import Root from "react-map-gl/maplibre";
import { useBasemapStyle } from "../hooks.js";

const MapFallback = {
    components: {
        useMapReducer() {
            return [{ viewState: null }, { setViewState: null }];
        },
    },
};

function Map({
    mapId,
    initBounds,
    children,
    containerStyle: initContainerStyle,
    basemap,
    ...mapProps
}) {
    const { useMapReducer } = useComponents(),
        [{ viewState: pluginViewState }, { setViewState: setPluginViewState }] =
            useMapReducer(),
        [localViewState, setLocalViewState] = useState(null),
        viewState = pluginViewState || localViewState,
        setViewState = setPluginViewState || setLocalViewState,
        onMove = useCallback(
            (evt) => setViewState(evt.viewState),
            [setViewState],
        ),
        style = useBasemapStyle(basemap),
        containerStyle = useMemo(
            () => ({
                flex: "1",
                minHeight: 200,
                ...initContainerStyle,
            }),
            [initContainerStyle],
        );

    return (
        <Root
            id={mapId}
            reuseMaps={Boolean(mapId)}
            mapStyle={style}
            initialViewState={!viewState && { bounds: initBounds }}
            onMove={onMove}
            style={containerStyle}
            {...mapProps}
            {...viewState}
        >
            {children}
        </Root>
    );
}

Map.propTypes = {
    mapId: PropTypes.string,
    initBounds: PropTypes.array,
    children: PropTypes.node,
    mapProps: PropTypes.object,
    containerStyle: PropTypes.object,
    basemap: PropTypes.object,
};

export default withWQ(Map, { fallback: MapFallback });
