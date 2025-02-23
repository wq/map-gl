import React, { useState, createContext } from "react";
import { withWQ } from "@wq/react";
import Map from "./Map.js";
import MapInteraction from "./MapInteraction.js";
import MapAutoZoom from "./MapAutoZoom.js";
import MapIdentify from "./MapIdentify.js";
import HighlightPopup from "./HighlightPopup.js";
import Geojson from "../overlays/Geojson.js";
import Tile from "../overlays/Tile.js";
import VectorTile from "../overlays/VectorTile.js";
import Highlight from "../overlays/Highlight.js";

const MapProviderDefaults = {
    components: {
        Map,
        MapInteraction,
        MapAutoZoom,
        MapIdentify,
        HighlightPopup,
        Geojson,
        Tile,
        VectorTile,
        Highlight,
    },
};

export const MapContext = createContext({ instance: null, setInstance() {} });

function MapProvider({ children }) {
    const [instance, setInstance] = useState(null);
    return (
        <MapContext.Provider value={{ instance, setInstance }}>
            {children}
        </MapContext.Provider>
    );
}

export default withWQ(MapProvider, { defaults: MapProviderDefaults });
