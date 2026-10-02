import { useState, useCallback } from "react";
import { withWQ } from "@wq/react";
import Map from "./components/Map.js";
import MapInteraction from "./components/MapInteraction.js";
import HighlightPopup from "./components/HighlightPopup.js";
import Geojson from "./overlays/Geojson.js";
import Tile from "./overlays/Tile.js";
import VectorTile from "./overlays/VectorTile.js";
import { useMapInstance, useGeolocation, MapContext } from "./hooks.js";

const MapProviderDefaults = {
    components: {
        MapProvider,
        Map,
        MapInteraction,
        HighlightPopup,
        Geojson,
        Tile,
        VectorTile,
        // eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix
        useControl() {
            console.warn("useControl() not available in @wq/map-gl-native");
            return null;
        },
        useMapInstance,
        useGeolocation,
    },
};

function MapProvider({ children }) {
    const [instance, setInstance] = useState(null),
        [layers, setLayers] = useState({}),
        addLayers = useCallback((newLayers) => {
            setLayers((prevLayers) => {
                const nextLayers = { ...prevLayers };
                for (const layer of newLayers) {
                    nextLayers[layer.id] = layer;
                }
                return nextLayers;
            });
        }, []),
        removeLayers = useCallback((oldLayers) => {
            setLayers((prevLayers) => {
                const nextLayers = { ...prevLayers };
                for (const layer of oldLayers) {
                    delete nextLayers[layer.id];
                }
                return nextLayers;
            });
        }, []);
    return (
        <MapContext.Provider
            value={{ instance, setInstance, addLayers, removeLayers, layers }}
        >
            {children}
        </MapContext.Provider>
    );
}

export default withWQ(MapProvider, { defaults: MapProviderDefaults });
