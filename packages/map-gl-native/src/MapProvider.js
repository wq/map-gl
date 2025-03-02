import React, { useState } from "react";
import { withWQ } from "@wq/react";
import Map from "./components/Map.js";
import MapInteraction from "./components/MapInteraction.js";
import MapAutoZoom from "./components/MapAutoZoom.js";
import MapIdentify from "./components/MapIdentify.js";
import HighlightPopup from "./components/HighlightPopup.js";
import Geojson from "./overlays/Geojson.js";
import Tile from "./overlays/Tile.js";
import VectorTile from "./overlays/VectorTile.js";
import Highlight from "./overlays/Highlight.js";
import {
    useMapInstance,
    useGeolocation,
    useBasemapStyle,
    MapContext,
} from "./hooks.js";

const MapProviderDefaults = {
    components: {
        MapProvider,
        Map,
        MapInteraction,
        MapAutoZoom,
        MapIdentify,
        HighlightPopup,
        Geojson,
        Tile,
        VectorTile,
        Highlight,
        useControl() {
            console.warn("useControl() not available in @wq/map-gl-native");
            return null;
        },
        useMapInstance,
        useGeolocation,
        useBasemapStyle,
    },
};

function MapProvider({ children }) {
    const [instance, setInstance] = useState(null);
    return (
        <MapContext.Provider value={{ instance, setInstance }}>
            {children}
        </MapContext.Provider>
    );
}

export default withWQ(MapProvider, { defaults: MapProviderDefaults });
