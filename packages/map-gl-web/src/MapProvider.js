import { MapProvider, useControl } from "react-map-gl/maplibre";
import { withWQ } from "@wq/react";
import Map from "./components/Map.js";
import MapInteraction from "./components/MapInteraction.js";
import HighlightPopup from "./components/HighlightPopup.js";
import Geojson from "./overlays/Geojson.js";
import Tile from "./overlays/Tile.js";
import VectorTile from "./overlays/VectorTile.js";
import { useMapInstance, useGeolocation } from "./hooks.js";

const MapProviderDefaults = {
    components: {
        MapProvider,
        Map,
        MapInteraction,
        HighlightPopup,
        Geojson,
        Tile,
        VectorTile,
        useControl,
        useMapInstance,
        useGeolocation,
    },
};

export default withWQ(MapProvider, { defaults: MapProviderDefaults });
