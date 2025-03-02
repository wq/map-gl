import { MapProvider, useControl } from "react-map-gl/maplibre";
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
import { useMapInstance, useGeolocation, useBasemapStyle } from "./hooks.js";

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
        useControl,
        useMapInstance,
        useGeolocation,
        useBasemapStyle,
    },
};

export default withWQ(MapProvider, { defaults: MapProviderDefaults });
