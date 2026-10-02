import PropTypes from "prop-types";
import { useComponents, withWQ, createFallbackComponent } from "@wq/react";

const HighlightFallback = {
    components: {
        Geojson: createFallbackComponent(
            "Geojson",
            "@wq/map-gl",
            "MapProvider",
        ),
    },
};

export function Highlight({ data }) {
    const { Geojson } = useComponents();
    return <Geojson name="Highlight" data={data} style={highlightStyle} />;
}

export const highlightStyle = {
    layers: [
        {
            id: "highlight-fill",
            type: "fill",
            paint: {
                "fill-color": "#0ff",
                "fill-opacity": [
                    "match",
                    ["geometry-type"],
                    ["Polygon", "MultiPolygon"],
                    0.2,
                    0,
                ],
            },
        },
        {
            id: "highlight-line",
            type: "line",
            paint: {
                "line-width": 5,
                "line-color": "#0ff",
                "line-opacity": [
                    "match",
                    ["geometry-type"],
                    ["LineString", "MultiLineString"],
                    1,
                    0,
                ],
            },
        },
        {
            id: "highlight-circle",
            type: "circle",
            paint: {
                "circle-color": "#0ff",
                "circle-radius": [
                    "match",
                    ["geometry-type"],
                    ["Point", "MultiPoint"],
                    9,
                    0,
                ],
                "circle-opacity": [
                    "match",
                    ["geometry-type"],
                    ["Point", "MultiPoint"],
                    0.7,
                    0,
                ],
            },
        },
    ],
};

Highlight.propTypes = {
    data: PropTypes.object,
};

export default withWQ(Highlight, { fallback: HighlightFallback });
