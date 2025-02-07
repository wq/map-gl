import React, { useMemo, Fragment } from "react";
import {
    useConfig,
    useComponents,
    withWQ,
    createFallbackComponents,
} from "@wq/react";
import {
    useRootMapReducer,
    useMapReducer,
    MapReducerProvider,
} from "../hooks.js";
import MapContainer from "./MapContainer.js";
import MapToolbar from "./MapToolbar.js";
import AutoOverlay from "./AutoOverlay.js";
import PropTypes from "prop-types";

export const AutoMapFallback = {
    config: {
        map: {
            basemaps: _defaultBasemaps(),
            initBounds: [
                [-180, -90],
                [180, 90],
            ],
            tiles: null,
            autoZoom: {
                wait: 0.5, // How long to wait before triggering autoZoom
                // Settings for fitBounds
                maxZoom: 13,
                animate: true,
            },
        },
    },
    components: {
        MapContainer,
        MapToolbar,
        MapLayers: Fragment,
        ...createFallbackComponents(
            [
                "Map",
                "MapInteraction",
                "MapAutoZoom",
                "MapIdentify",
                "Highlight",
                "HighlightPopup",
            ],
            "@wq/map-gl",
            "MapProvider"
        ),
    },
};

export const AutoMapDefaults = {
    components: {
        AutoOverlay,
        useMapReducer,
    },
};

function AutoMap({
    name,
    mapId,
    toolbar = true,
    toolbarAnchor = "top-right",
    containerStyle,
    context = {},
    overlays: initialOverlays = [],
    basemaps: initialBasemaps = null,
    initBounds: initialInitBounds = null,
    tiles: initialTiles = null,
    autoZoom: initialAutoZoom = null,
    activeBasemap = null,
    onChangeBasemap = null,
    activeOverlays = null,
    onChangeOverlays = null,
    children,
    mapProps = {},
}) {
    const config = useConfig("map");
    if (initialBasemaps === null) {
        initialBasemaps = config.basemaps;
    }
    if (initialInitBounds === null) {
        initialInitBounds = config.initBounds;
    }
    if (initialTiles === null) {
        initialTiles = config.tiles;
    }
    if (initialAutoZoom === null) {
        initialAutoZoom = config.autoZoom;
    }

    const reducer = useRootMapReducer(
            {
                basemaps: initialBasemaps,
                overlays: initialOverlays,
                initBounds: initialInitBounds,
                tiles: initialTiles,
                autoZoom: initialAutoZoom,
                activeBasemap,
                activeOverlays,
            },
            onChangeBasemap,
            onChangeOverlays
        ),
        [state, actions] = reducer,
        {
            MapContainer,
            MapToolbar,
            Map,
            MapInteraction,
            MapAutoZoom,
            MapIdentify,
            MapLayers,
            AutoOverlay,
            Highlight,
            HighlightPopup,
        } = useComponents(),
        { basemaps, overlays, initBounds, tiles, autoZoom, highlight } = state,
        { showOverlay, hideOverlay, setBasemap, setHighlight, clearHighlight } =
            actions;

    const defaultTileSource = useMemo(() => {
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

    const identify = overlays.some((overlay) => !!overlay.popup);

    if (toolbar === true) {
        toolbar = (
            <MapToolbar
                name={name}
                mapId={mapId}
                basemaps={basemaps}
                overlays={overlays}
                showOverlay={showOverlay}
                hideOverlay={hideOverlay}
                setBasemap={setBasemap}
                context={context}
                anchor={toolbarAnchor}
            />
        );
    } else if (!toolbar) {
        toolbar = false;
    }

    return (
        <MapReducerProvider value={reducer}>
            <MapContainer name={name} mapId={mapId}>
                {toolbarAnchor.endsWith("left") && toolbar}
                <Map
                    name={name}
                    mapId={mapId}
                    initBounds={initBounds}
                    containerStyle={containerStyle}
                    basemap={basemaps.find((b) => b.active)}
                    {...mapProps}
                >
                    <MapInteraction name={name} mapId={mapId} />
                    {!!autoZoom && (
                        <MapAutoZoom
                            name={name}
                            mapId={mapId}
                            context={context}
                            {...autoZoom}
                        />
                    )}
                    {identify && (
                        <MapIdentify
                            name={name}
                            mapId={mapId}
                            context={context}
                            overlays={overlays}
                            setHighlight={setHighlight}
                        />
                    )}
                    <MapLayers>
                        {defaultTileSource && (
                            <AutoOverlay active {...defaultTileSource} />
                        )}
                        {overlays.map((conf) => (
                            <AutoOverlay
                                key={conf.name}
                                {...conf}
                                context={context}
                            />
                        ))}
                    </MapLayers>
                    {highlight && <Highlight data={highlight} />}
                    <HighlightPopup
                        inMap
                        data={highlight}
                        onClose={clearHighlight}
                    />
                    {children}
                </Map>
                {toolbarAnchor.endsWith("right") && toolbar}
                <HighlightPopup data={highlight} onClose={clearHighlight} />
            </MapContainer>
        </MapReducerProvider>
    );
}

AutoMap.propTypes = {
    name: PropTypes.string,
    mapId: PropTypes.string,
    toolbar: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
    toolbarAnchor: PropTypes.string,
    containerStyle: PropTypes.object,
    context: PropTypes.object,
    overlays: PropTypes.arrayOf(PropTypes.object),
    activeBasemap: PropTypes.string,
    onChangeBasemap: PropTypes.func,
    activeOverlays: PropTypes.arrayOf(PropTypes.string),
    onChangeOverlays: PropTypes.func,
    children: PropTypes.node,
    basemaps: PropTypes.arrayOf(PropTypes.object),
    initBounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    tiles: PropTypes.string,
    autoZoom: PropTypes.object,
    mapProps: PropTypes.object,
};

export default withWQ(AutoMap, {
    defaults: AutoMapDefaults,
    fallback: AutoMapFallback,
});

// Default base map configuration - override to customize
function _defaultBasemaps() {
    var cdn =
        "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg";
    var attr =
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.';

    return [
        {
            name: "Stamen Terrain",
            type: "tile",
            url: cdn,
            attribution: attr,
        },
    ];
}
