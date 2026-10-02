import { Root } from "@wq/material";
import { MapProvider, AutoMap } from "@wq/map-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map() {
    return (
        <Root theme>
            <MapProvider>
                <AutoMap
                    mapId="example"
                    overlays={overlays}
                    initialViewState={{
                        longitude: 180,
                        latitude: 65,
                        zoom: 1,
                    }}
                />
            </MapProvider>
        </Root>
    );
}

const overlays = [
    {
        name: "Locations",
        type: "geojson",
        active: true,
        popup: true,
        color: "green",
        data: {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    id: 1,
                    properties: { name: "Busan" },
                    geometry: {
                        type: "Point",
                        coordinates: [129.0756, 35.1796],
                    },
                },
                {
                    type: "Feature",
                    id: 2,
                    properties: { name: "Minneapolis" },
                    geometry: {
                        type: "Point",
                        coordinates: [-93.265, 44.9778],
                    },
                },
                {
                    type: "Feature",
                    id: 3,
                    properties: { name: "Anchorage" },
                    geometry: {
                        type: "Point",
                        coordinates: [-149.9003, 61.2181],
                    },
                },
            ],
        },
    },
    {
        name: "Routes",
        type: "geojson",
        active: true,
        popup: true,
        color: "red",
        data: {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    id: 1,
                    properties: { name: "Tokyo - Los Angeles" },
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [139.6917, 35.6895],
                            [360 - 118.2437, 34.0522],
                        ],
                    },
                },
            ],
        },
    },
    {
        name: "Regions",
        type: "geojson",
        active: true,
        popup: true,
        color: "blue",
        data: {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    id: 1,
                    properties: {
                        name: "British Columbia",
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-139.06, 60.0],
                                [-139.06, 49.0],
                                [-114.03, 49.0],
                                [-114.03, 60.0],
                                [-139.06, 60.0],
                            ],
                        ],
                    },
                },
                {
                    type: "Feature",
                    id: 2,
                    properties: {
                        name: "Eastern Siberia",
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [120.0, 70.0],
                                [120.0, 50.0],
                                [150.0, 50.0],
                                [150.0, 70.0],
                                [120.0, 70.0],
                            ],
                        ],
                    },
                },
            ],
        },
    },
];
