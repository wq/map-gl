import { useEffect, useRef } from "react";
import union from "@turf/union";
import { useComponents, withWQ, createFallbackComponent } from "@wq/react";
import { makeStyleProp } from "../hooks.js";

const MapIdentifyFallback = {
    components: {
        useMapInstance: createFallbackComponent(
            "useMapInstance",
            "@wq/map-gl",
            "MapProvider",
        ),
    },
};

function MapIdentify({ overlays, setHighlight }) {
    const { useMapInstance } = useComponents(),
        map = useMapInstance();
    useMapIdentify(map, overlays, setHighlight);
}

export function useMapIdentify(map, overlays, setHighlight) {
    const overlaysRef = useRef();

    useEffect(() => {
        if (overlaysRef.current !== overlays) {
            overlaysRef.current = overlays;
        }
    }, [overlays]);

    useEffect(() => {
        if (!map) {
            return;
        }
        const overlays = overlaysRef.current || [],
            layers = {};

        for (const overlay of overlays) {
            if (!overlay.active) {
                continue;
            }
            for (const layer of getIdentifyLayers(overlay)) {
                layers[layer] = overlay;
            }
        }

        map.on("mousemove", updateCursor);
        map.on("click", updateHighlight);

        function updateCursor(evt) {
            updateCursorAsync(evt).catch((err) => {
                console.error("Error in updateCursor:", err);
            });
        }
        async function updateCursorAsync(evt) {
            const features = await map.queryRenderedFeatures(evt.point, {
                layers: Object.keys(layers),
            });
            if (features.length) {
                map.getCanvas().style.cursor = "pointer";
            } else {
                map.getCanvas().style.cursor = "";
            }
        }

        function updateHighlight(evt) {
            updateHighlightAsync(evt).catch((err) => {
                console.error("Error in updateHighlight:", err);
            });
        }
        async function updateHighlightAsync(evt) {
            const renderedfeatures = await map.queryRenderedFeatures(
                evt.point,
                {
                    layers: Object.keys(layers),
                },
            );
            const uniqueFeatures = renderedfeatures.filter(
                (feature, i) =>
                    renderedfeatures.findIndex(
                        (f) =>
                            f.id === feature.id &&
                            f.source === feature.source &&
                            f.sourceLayer === feature.sourceLayer,
                    ) === i,
            );
            const highlightFeatures = uniqueFeatures.map(async (feat) => {
                const overlay = layers[feat.layer.id];
                const feature = {
                    id: feat.id,
                    type: "Feature",
                    properties: { ...feat.properties },
                    geometry: feat.geometry,
                    popup: overlay?.popup,
                    overlay: overlay,
                    layer: feat.layer,
                    source: feat.source,
                    sourceLayer: feat.sourceLayer,
                };
                if (
                    feature.source &&
                    feature.sourceLayer &&
                    feature.geometry.type !== "Point"
                ) {
                    const sourceFeatures = await map.querySourceFeatures(
                            feature.source,
                            {
                                sourceLayer: feature.sourceLayer,
                                filter: ["==", ["id"], feature.id],
                            },
                        ),
                        sourceFeature =
                            sourceFeatures.length > 1
                                ? union({
                                      type: "FeatureCollection",
                                      features: sourceFeatures,
                                  })
                                : sourceFeatures[0];
                    if (sourceFeature && sourceFeature.geometry) {
                        feature.geometry = sourceFeature.geometry;
                    }
                }
                return feature;
            });
            setHighlight({
                type: "FeatureCollection",
                features: await Promise.all(highlightFeatures),
            });
        }

        return () => {
            map.off("mousemove", updateCursor);
            map.off("click", updateHighlight);
        };
    }, [map, setHighlight]);

    return null;
}

export function getIdentifyLayers(overlay) {
    if (overlay.identifyLayers) {
        return overlay.identifyLayers;
    }
    if (!overlay.popup) {
        return [];
    }
    if (overlay.type == "group") {
        return (overlay.layers || [])
            .map((layer) => getIdentifyLayers(layer))
            .flat();
    }
    if (overlay.type === "geojson" || overlay.type === "vector-tile") {
        return makeStyleProp(overlay).layers.map((layer) => layer.id);
    }
    return [];
}

export default withWQ(MapIdentify, { fallback: MapIdentifyFallback });
