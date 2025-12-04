import { contextFeature, contextFeatureCollection } from "../index.js";

test("context geojson fields", () => {
    expect(
        contextFeatureCollection(
            {
                list: [
                    {
                        id: "one",
                        geometry: { type: "Point", coordinates: [0, 0] },
                    },
                ],
            },
            "geometry",
        ),
    ).toEqual({
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                id: "one",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    id: "one",
                    geometry: { type: "Point", coordinates: [0, 0] },
                },
            },
        ],
    });

    expect(
        contextFeature(
            {
                id: "one",
                geometry: { type: "Point", coordinates: [0, 0] },
            },
            "geometry",
        ),
    ).toEqual({
        type: "Feature",
        id: "one",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {
            id: "one",
            geometry: { type: "Point", coordinates: [0, 0] },
        },
    });

    expect(
        contextFeatureCollection(
            {
                list: [
                    {
                        id: 1,
                        general: {
                            name: "Test 1",
                            geometry: {
                                type: "Point",
                                coordinates: [0, 0],
                            },
                        },
                    },
                ],
            },
            "general.geometry",
        ),
    ).toEqual({
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                id: 1,
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    id: 1,
                    general: {
                        name: "Test 1",
                        geometry: {
                            type: "Point",
                            coordinates: [0, 0],
                        },
                    },
                },
            },
        ],
    });

    const itemWithObservations = {
        id: 1,
        name: "Test 1",
        observations: [
            {
                notes: "Observation 1",
                location: {
                    type: "Point",
                    coordinates: [0, 0],
                },
            },
            {
                notes: "Observation 2",
                location: {
                    type: "Point",
                    coordinates: [1, 1],
                },
            },
        ],
    };
    expect(
        contextFeatureCollection(
            {
                list: [itemWithObservations],
            },
            "observations[].location",
        ),
    ).toEqual({
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                id: 1,
                geometry: {
                    type: "GeometryCollection",
                    geometries: [
                        { type: "Point", coordinates: [0, 0] },
                        { type: "Point", coordinates: [1, 1] },
                    ],
                },
                properties: itemWithObservations,
            },
        ],
    });
});

/*

const expectedLayers = [
    {
        type: "geojson",
        name: "Map Test",
        active: true,
        url: "test.geojson",
    },
];

test.skip("list map", async () => {
    const context = {
        list: [
            {
                id: "one",
                geometry: { type: "Point", coordinates: [0, 0] },
            },
        ],
    };
    setRouteInfo(
        {
            page: "item",
            mode: "list",
        },
        context
    );

    const result = renderTest(() => <AutoMap context={context} />, mockApp),
        overlay = result.root.findByType(Geojson);

    expect(overlay.props).toEqual({
        name: "item",
        popup: "item",
        data: {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    id: "one",
                    geometry: { type: "Point", coordinates: [0, 0] },
                    properties: {
                        id: "one",
                        geometry: { type: "Point", coordinates: [0, 0] },
                    },
                },
            ],
        },
        cluster: true,
        active: true,
    });

    result.unmount();
});

test.skip("edit map", async () => {
    const point = {
        type: "Point",
        coordinates: [45, -95],
    };

    setRouteInfo(
        {
            page: "item",
            mode: "edit",
            item_id: 123,
            outbox_id: 1,
        },
        {
            geometry: point,
        }
    );

    const Component = () => (
        <Form data={{ point: point }}>
            <Geo type="geopoint" name="point" />
        </Form>
    );

    const result = renderTest(Component, mockApp),
        overlay = result.root.findByType(Draw);

    const { type, data } = overlay.props;
    expect(type).toEqual("point");
    expect(data).toEqual({
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},
                geometry: point,
            },
        ],
    });

    result.unmount();
});

test.skip("special layer types", async () => {
    setRouteInfo({
        page: "special",
    });

    const result = renderTest(AutoMap, mockApp),
        overlays = result.root
            .findAllByType(Geojson)
            .map((overlay) => overlay.props);

    expect(overlays).toHaveLength(2);
    expect(overlays[0]).toEqual({
        name: "Group 1-0",
        active: true,
        url: "layer1.geojson",
    });
    expect(overlays[1]).toEqual({
        name: "Group 1-1",
        active: true,
        url: "layer2.geojson",
    });

    result.unmount();
});

test.skip("toggle layers", async () => {
    setRouteInfo({
        page: "multilayer",
    });
    const { routes, ...currentMapState } = store.getState().map,
        expectedMapState = {
            routeName: "multilayer",
            basemaps: [
                {
                    name: "Basemap 1",
                    type: "tile",
                    url: "http://example.org/street/{z}/{x}/{y}.png",
                    active: true,
                },
                {
                    name: "Basemap 2",
                    url: "http://example.org/aerial/{z}/{x}/{y}.png",
                    type: "tile",
                    active: false,
                },
            ],
            overlays: [
                {
                    name: "Layer 1",
                    type: "geojson",
                    url: "layer1.geojson",
                    active: true,
                },
                {
                    name: "Layer 2",
                    type: "geojson",
                    url: "layer2.geojson",
                    active: true,
                },
                {
                    name: "Layer 3",
                    type: "geojson",
                    url: "layer3.geojson",
                    active: false,
                },
            ],
            viewState: null,
            initBounds: [
                [-4, -4],
                [4, 4],
            ],
            autoZoom: {
                wait: 0.5,
                maxZoom: 13,
                animate: true,
            },
            mapProps: undefined,
            mapId: undefined,
            highlight: null,
        };

    expect(currentMapState).toEqual(expectedMapState);
    expect(routes.multilayer).toEqual(expectedMapState);

    map.setBasemap("Basemap 2");
    expect(store.getState().map.basemaps).toEqual([
        {
            name: "Basemap 1",
            type: "tile",
            url: "http://example.org/street/{z}/{x}/{y}.png",
            active: false,
        },
        {
            name: "Basemap 2",
            url: "http://example.org/aerial/{z}/{x}/{y}.png",
            type: "tile",
            active: true,
        },
    ]);

    map.hideOverlay("Layer 2");
    map.showOverlay("Layer 3");

    expect(store.getState().map.overlays).toEqual([
        {
            name: "Layer 1",
            type: "geojson",
            url: "layer1.geojson",
            active: true,
        },
        {
            name: "Layer 2",
            type: "geojson",
            url: "layer2.geojson",
            active: false,
        },
        {
            name: "Layer 3",
            type: "geojson",
            url: "layer3.geojson",
            active: true,
        },
    ]);
});

test.skip("highlight layer", async () => {
    setRouteInfo({
        page: "multilayer",
    });

    const geojson = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [45, -95],
                },
            },
        ],
    };

    map.setHighlight(geojson);

    const result = renderTest(AutoMap, mockApp),
        overlay = result.root.findByType(Highlight);

    expect(overlay.props.data).toEqual(geojson);

    result.unmount();
});

*/
