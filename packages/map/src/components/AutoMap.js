import { Fragment } from "react";
import {
    useConfig,
    useComponents,
    withWQ,
    createFallbackComponents,
} from "@wq/react";
import {
    useRootMapReducer,
    useMapReducer,
    useDefaultTileSource,
    MapReducerProvider,
} from "../hooks.js";
import MapContainer from "./MapContainer.js";
import MapIdentify from "./MapIdentify.js";
import MapToolbar from "./MapToolbar.js";
import AutoOverlay from "./AutoOverlay.js";
import Highlight from "./Highlight.js";
import PropTypes from "prop-types";

export const AutoMapFallback = {
    config: {
        map: {
            basemaps: _defaultBasemaps(),
            initialViewState: {
                bounds: [
                    [-180, -90],
                    [180, 90],
                ],
            },
            tiles: null,
        },
    },
    components: {
        MapContainer,
        MapIdentify,
        MapToolbar,
        MapLayers: Fragment,
        Highlight,
        ...createFallbackComponents(
            ["Map", "MapInteraction", "HighlightPopup"],
            "@wq/map-gl",
            "MapProvider",
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
    toolbar: Toolbar = true,
    toolbarAnchor = "top-right",
    context = {},
    overlays: initialOverlays = null,
    basemaps: initialBasemaps = null,
    initialViewState: initialInitialViewState = null,
    tiles: initialTiles = null,
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
    if (initialInitialViewState === null) {
        initialInitialViewState = config.initialViewState;
    }
    if (initialTiles === null) {
        initialTiles = config.tiles;
    }

    const reducer = useRootMapReducer(
            {
                basemaps: initialBasemaps,
                overlays: initialOverlays,
                initialViewState: initialInitialViewState,
                tiles: initialTiles,
                activeBasemap,
                activeOverlays,
            },
            onChangeBasemap,
            onChangeOverlays,
        ),
        [state, actions] = reducer;

    const {
            MapContainer,
            MapToolbar,
            Map,
            MapInteraction,
            MapIdentify,
            MapLayers,
            AutoOverlay,
            Highlight,
            HighlightPopup,
        } = useComponents(),
        { basemaps, overlays, initialViewState, tiles, highlight } = state,
        { showOverlay, hideOverlay, setBasemap, setHighlight, clearHighlight } =
            actions;

    const defaultTileSource = useDefaultTileSource(tiles);
    const identify = overlays.some((overlay) => !!overlay.popup);
    const basemap = basemaps.find((b) => b.active);
    const toolbar = (() => {
        const toolbarProps = {
            name,
            mapId,
            basemaps,
            overlays,
            showOverlay,
            hideOverlay,
            setBasemap,
            context,
            anchor: toolbarAnchor,
        };
        if (Toolbar === true) {
            return <MapToolbar {...toolbarProps} />;
        } else if (typeof Toolbar === "function") {
            return <Toolbar {...toolbarProps} />;
        } else if (!Toolbar) {
            return false;
        } else {
            return Toolbar;
        }
    })();

    return (
        <MapReducerProvider state={state} actions={actions}>
            <MapContainer name={name} mapId={mapId}>
                {toolbarAnchor.endsWith("left") && toolbar}
                <Map
                    name={name}
                    mapId={mapId}
                    basemap={basemap}
                    initialViewState={initialViewState}
                    {...mapProps}
                >
                    <MapInteraction name={name} mapId={mapId} />
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
    context: PropTypes.object,
    overlays: PropTypes.arrayOf(PropTypes.object),
    activeBasemap: PropTypes.string,
    onChangeBasemap: PropTypes.func,
    activeOverlays: PropTypes.arrayOf(PropTypes.string),
    onChangeOverlays: PropTypes.func,
    children: PropTypes.node,
    basemaps: PropTypes.arrayOf(PropTypes.object),
    initialViewState: PropTypes.object,
    tiles: PropTypes.string,
    mapProps: PropTypes.object,
};

export default withWQ(AutoMap, {
    defaults: AutoMapDefaults,
    fallback: AutoMapFallback,
});

// Default base map configuration - override to customize
function _defaultBasemaps() {
    return [
        {
            name: "Globe",
            type: "vector-tile",
            url: "https://demotiles.maplibre.org/globe.json",
        },
        {
            name: "Web Mercator",
            type: "vector-tile",
            url: "https://demotiles.maplibre.org/style.json",
        },
    ];
}
