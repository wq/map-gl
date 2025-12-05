import { useEffect } from "react";
import bbox from "@turf/bbox";
import { useMapInstance } from "../hooks.js";

export default function MapAutoZoom({
    mapId,
    context,
    wait,
    maxZoom,
    animate,
    sources: filterSources,
}) {
    const map = useMapInstance(mapId);

    useEffect(() => {
        if (!map || !context) {
            return;
        }
        const startTime = new Date();

        map.on("idle", autoZoom);

        async function autoZoom() {
            map.off("idle", autoZoom);
            const sources = map.getStyle().sources,
                allFeatures = [];
            for (const name in sources) {
                if (filterSources && !filterSources.includes(name)) {
                    continue;
                }
                const source = sources[name];
                if (source.type !== "geojson") {
                    continue;
                }

                let data;
                if (typeof source.data === "object") {
                    data = source.data;
                } else {
                    try {
                        const response = await fetch(source.data);
                        data = await response.json();
                    } catch (e) {
                        console.error(e);
                        data = { type: "FeatureCollection", features: [] };
                    }
                }

                let features;
                if (data.type === "FeatureCollection") {
                    features = data.features || [];
                } else if (data.type === "Feature") {
                    features = [data];
                } else {
                    features = [{ type: "Feature", geometry: data }];
                }

                allFeatures.push(...features);
            }

            const bounds = bbox({
                type: "FeatureCollection",
                features: allFeatures,
            });
            if (bounds) {
                const elapsed = new Date() - startTime,
                    timeout = Math.max(wait * 1000 - elapsed, 0);
                setTimeout(() => {
                    map.fitBounds(bounds, { padding: 32, maxZoom, animate });
                }, timeout);
            }
        }
    }, [map, context]);

    return null;
}
