import { makeStyleProp } from "../index.js";

test("geojson styles", () => {
    // Default style
    expect(
        makeStyleProp({
            name: "test",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        }),
    ).toEqual({
        sources: {
            test: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            },
        },
        layers: [
            {
                id: "test-fill",
                type: "fill",
                source: "test",
                paint: {
                    "fill-color": "#3388ff",
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
                id: "test-line",
                type: "line",
                source: "test",
                paint: {
                    "line-color": "#3388ff",
                    "line-opacity": 1,
                    "line-width": 3,
                },
            },
            {
                id: "test-circle",
                type: "circle",
                source: "test",
                paint: {
                    "circle-color": "white",
                    "circle-radius": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        3,
                        0,
                    ],
                    "circle-stroke-color": "#3086cc",
                    "circle-stroke-width": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        3,
                        0,
                    ],
                    "circle-opacity": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        1,
                        0,
                    ],
                },
            },
        ],
    });

    // Icon style
    expect(
        makeStyleProp({
            name: "test",
            data: {
                type: "FeatureCollection",
                features: [],
            },
            icon: "test-icon",
        }),
    ).toEqual({
        sources: {
            test: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            },
        },
        layers: [
            {
                id: "test",
                type: "symbol",
                source: "test",
                layout: {
                    "icon-image": "test-icon",
                    "icon-allow-overlap": true,
                },
            },
        ],
    });

    // Color style
    expect(
        makeStyleProp({
            name: "test",
            color: "#00ff00",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        }),
    ).toEqual({
        sources: {
            test: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            },
        },
        layers: [
            {
                id: "test-fill",
                type: "fill",
                source: "test",
                paint: {
                    "fill-color": "#00ff00",
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
                id: "test-line",
                type: "line",
                source: "test",
                paint: {
                    "line-color": "#00ff00",
                    "line-opacity": 1,
                    "line-width": 3,
                },
            },
            {
                id: "test-circle",
                type: "circle",
                source: "test",
                paint: {
                    "circle-color": "white",
                    "circle-radius": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        3,
                        0,
                    ],
                    "circle-stroke-color": "#00ff00",
                    "circle-stroke-width": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        3,
                        0,
                    ],
                    "circle-opacity": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        1,
                        0,
                    ],
                },
            },
        ],
    });

    // Custom style
    expect(
        makeStyleProp({
            name: "test",
            style: {
                layers: [
                    {
                        type: "fill",
                        paint: {
                            "fill-color": "#ff0000",
                        },
                    },
                ],
            },
            data: {
                type: "FeatureCollection",
                features: [],
            },
        }),
    ).toEqual({
        sources: {
            test: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            },
        },
        layers: [
            {
                id: "test",
                source: "test",
                type: "fill",
                paint: {
                    "fill-color": "#ff0000",
                },
            },
        ],
    });
});

test("vector tile styles", () => {
    // Default style
    expect(
        makeStyleProp({
            name: "test",
            layer: "locations",
        }),
    ).toEqual({
        sources: {},
        layers: [
            {
                id: "locations-fill",
                type: "fill",
                source: "_default",
                "source-layer": "locations",
                paint: {
                    "fill-color": "#3388ff",
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
                id: "locations-line",
                type: "line",
                source: "_default",
                "source-layer": "locations",
                paint: {
                    "line-color": "#3388ff",
                    "line-opacity": 1,
                    "line-width": 3,
                },
            },
            {
                id: "locations-circle",
                type: "circle",
                source: "_default",
                "source-layer": "locations",
                paint: {
                    "circle-color": "white",
                    "circle-radius": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        3,
                        0,
                    ],
                    "circle-stroke-color": "#3086cc",
                    "circle-stroke-width": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        3,
                        0,
                    ],
                    "circle-opacity": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        1,
                        0,
                    ],
                },
            },
        ],
    });

    // Symbol style
    expect(
        makeStyleProp({
            name: "test",
            layer: "locations",
            icon: "test-icon",
        }),
    ).toEqual({
        sources: {},
        layers: [
            {
                id: "locations",
                type: "symbol",
                source: "_default",
                "source-layer": "locations",
                layout: {
                    "icon-image": "test-icon",
                    "icon-allow-overlap": true,
                },
            },
        ],
    });

    // Color style
    expect(
        makeStyleProp({
            name: "test",
            layer: "locations",
            color: "#00ff00",
        }),
    ).toEqual({
        sources: {},
        layers: [
            {
                id: "locations-fill",
                type: "fill",
                source: "_default",
                "source-layer": "locations",
                paint: {
                    "fill-color": "#00ff00",
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
                id: "locations-line",
                type: "line",
                source: "_default",
                "source-layer": "locations",
                paint: {
                    "line-color": "#00ff00",
                    "line-opacity": 1,
                    "line-width": 3,
                },
            },
            {
                id: "locations-circle",
                type: "circle",
                source: "_default",
                "source-layer": "locations",
                paint: {
                    "circle-color": "white",
                    "circle-radius": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        3,
                        0,
                    ],
                    "circle-stroke-color": "#00ff00",
                    "circle-stroke-width": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        3,
                        0,
                    ],
                    "circle-opacity": [
                        "match",
                        ["geometry-type"],
                        ["Point", "MultiPoint"],
                        1,
                        0,
                    ],
                },
            },
        ],
    });

    // Custom style
    expect(
        makeStyleProp({
            name: "test",
            style: {
                sources: {
                    test: {
                        type: "vector",
                        url: "https://example.com/vector-tiles.json",
                    },
                },
                layers: [
                    {
                        id: "test",
                        source: "test",
                        ["source-layer"]: "test",
                        type: "fill",
                        paint: {
                            "fill-color": "#ff0000",
                        },
                    },
                ],
            },
        }),
    ).toEqual({
        sources: {
            test: {
                type: "vector",
                url: "https://example.com/vector-tiles.json",
            },
        },
        layers: [
            {
                id: "test",
                source: "test",
                ["source-layer"]: "test",
                type: "fill",
                paint: {
                    "fill-color": "#ff0000",
                },
            },
        ],
    });
});
