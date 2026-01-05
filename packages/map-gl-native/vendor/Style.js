/*
   This file is adapted from Style.tsx in @maplibre/maplibre-react-native.
   Style.tsx was removed from the library after version 10.0.0-beta.6.
   https://raw.githubusercontent.com/maplibre/maplibre-react-native/refs/tags/v10.0.0-beta.6/src/components/Style.tsx
 
   Changes:
    * Converted from TypeScript to JavaScript
    * Export asLayerComponent
*/

import React, { useMemo, useState, useEffect } from "react";

import {
    BackgroundLayer,
    CircleLayer,
    FillExtrusionLayer,
    FillLayer,
    HeatmapLayer,
    ImageSource,
    LineLayer,
    RasterLayer,
    RasterSource,
    ShapeSource,
    SymbolLayer,
    VectorSource,
} from "@maplibre/maplibre-react-native";

function toCamelCase(s) {
    return s.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace("-", "").replace("_", "");
    });
}

// Patches the Mapbox Style Specification keys into the style props attributes:
// icon-allow-overlap -> iconAllowOverlap
function toCamelCaseKeys(oldObj) {
    if (!oldObj) {
        return {};
    }
    const newObj = {};
    Object.keys(oldObj).forEach((key) => {
        const value = oldObj[key];
        if (key.includes("-")) {
            newObj[toCamelCase(key)] = value;
        } else {
            newObj[key] = value;
        }
    });
    return newObj;
}

function getLayerComponentType(layer) {
    const { type } = layer;

    switch (type) {
        case "circle":
            return CircleLayer;
        case "symbol":
            return SymbolLayer;
        case "raster":
            return RasterLayer;
        case "line":
            return LineLayer;
        case "fill":
            return FillLayer;
        case "fill-extrusion":
            return FillExtrusionLayer;
        case "background":
            return BackgroundLayer;
        case "heatmap":
            return HeatmapLayer;
    }

    console.warn(`Mapbox layer type '${type}' is not supported/`);

    return null;
}

export function asLayerComponent(layer, extraProps) {
    const LayerComponent = getLayerComponentType(layer);

    if (!LayerComponent) {
        return null;
    }

    const style = {
        ...toCamelCaseKeys(layer.paint),
        ...toCamelCaseKeys(layer.layout),
    };

    const layerProps = { ...extraProps };

    if (layer.source) {
        layerProps.sourceID = layer.source;
    }
    if (layer["source-layer"]) {
        layerProps.sourceLayerID = layer["source-layer"];
    }
    if (layer.minzoom) {
        layerProps.minZoomLevel = layer.minzoom;
    }
    if (layer.maxzoom) {
        layerProps.maxZoomLevel = layer.maxzoom;
    }
    if (layer.filter) {
        layerProps.filter = layer.filter;
    }
    if (Object.keys(style).length) {
        layerProps.style = style;
    }

    return <LayerComponent key={layer.id} id={layer.id} {...layerProps} />;
}

function getTileSourceProps(source) {
    const sourceProps = {};
    if (source.url) {
        sourceProps.url = source.url;
    }
    if (source.tiles) {
        sourceProps.tileUrlTemplates = source.tiles;
    }
    if (source.minzoom !== undefined) {
        sourceProps.minZoomLevel = source.minzoom;
    }
    if (source.maxzoom !== undefined) {
        sourceProps.maxZoomLevel = source.maxzoom;
    }
    if (source.attribution) {
        sourceProps.attribution = source.attribution;
    }
    if (source.scheme && source.scheme === "tms") {
        sourceProps.tms = true;
    }
    return sourceProps;
}

function getVectorSource(id, source) {
    const sourceProps = { ...getTileSourceProps(source) };
    return <VectorSource key={id} id={id} {...sourceProps} />;
}

function getRasterSource(id, source) {
    const sourceProps = {
        ...getTileSourceProps(source),
    };
    if (source.tileSize) {
        sourceProps.tileSize = source.tileSize;
    }
    return <RasterSource key={id} id={id} {...sourceProps} />;
}

function getImageSource(id, source) {
    const sourceProps = {
        url: source.url,
        coordinates: source.coordinates,
    };
    return <ImageSource key={id} id={id} {...sourceProps} />;
}

function getShapeSource(id, source) {
    const sourceProps = {};
    if (source.data && typeof source.data === "string") {
        sourceProps.url = source.data;
    } else if (source.data && typeof source.data === "object") {
        sourceProps.shape = source.data;
    }
    if (source.cluster !== undefined) {
        sourceProps.cluster = source.cluster;
    }
    if (source.clusterRadius !== undefined) {
        sourceProps.clusterRadius = source.clusterRadius;
    }
    if (source.maxzoom !== undefined) {
        sourceProps.maxZoomLevel = source.maxzoom;
    }
    if (source.clusterMaxZoom !== undefined) {
        sourceProps.clusterMaxZoomLevel = source.clusterMaxZoom;
    }
    if (source.clusterProperties !== undefined) {
        sourceProps.clusterProperties = source.clusterProperties;
    }
    if (source.buffer !== undefined) {
        sourceProps.buffer = source.buffer;
    }
    if (source.tolerance !== undefined) {
        sourceProps.tolerance = source.tolerance;
    }
    if (source.lineMetrics !== undefined) {
        sourceProps.lineMetrics = source.lineMetrics;
    }
    return <ShapeSource key={id} id={id} {...sourceProps} />;
}

function asSourceComponent(id, source) {
    switch (source.type) {
        case "vector":
            return getVectorSource(id, source);
        case "raster":
            return getRasterSource(id, source);
        case "image":
            return getImageSource(id, source);
        case "geojson":
            return getShapeSource(id, source);
    }

    console.warn(`MapLibre source type '${source.type}' is not supported`);

    return null;
}

/**
 * Style is a component that automatically adds sources / layers to the map using MapLibre Style Spec.
 * Only [`sources`](https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/) & [`layers`](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/) are supported.
 * Other fields such as `sprites`, `glyphs` etc. will be ignored. Not all layer / source attributes from the style spec are supported, in general the supported attributes will be mentioned under https://github.com/maplibre/maplibre-react-native/tree/main/docs.
 *
 * TODO: Maintainer forking this project does not understand the above comment regarding what is supported.
 */
const Style = (props) => {
    const [fetchedJson, setFetchedJson] = useState({});
    const json = typeof props.json === "object" ? props.json : fetchedJson;

    // Fetch style when props.json is a URL
    useEffect(() => {
        const abortController = new AbortController();
        const fetchStyleJson = async (url) => {
            try {
                const response = await fetch(url, {
                    signal: abortController.signal,
                });
                const responseJson = await response.json();
                setFetchedJson(responseJson);
            } catch (error) {
                const e = error;
                if (e.name === "AbortError") {
                    return;
                }
                throw e;
            }
        };
        if (typeof props.json === "string") {
            fetchStyleJson(props.json);
        }
        return function cleanup() {
            abortController.abort();
        };
    }, [props.json]);

    // Extract layer components from json
    const layerComponents = useMemo(() => {
        if (!json.layers) {
            return [];
        }
        return json.layers.map(asLayerComponent).filter((x) => !!x);
    }, [json.layers]);

    // Extract source components from json
    const sourceComponents = useMemo(() => {
        const { sources } = json;
        if (!sources || !Object.keys(sources)) {
            return [];
        }
        return Object.entries(sources)
            .map(([id, source]) => asSourceComponent(id, source))
            .filter((x) => !!x);
    }, [json]);

    return (
        <>
            {sourceComponents}
            {layerComponents}
        </>
    );
};

export default Style;
