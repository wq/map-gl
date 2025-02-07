import React from "react";
import { NavigationControl, ScaleControl } from "react-map-gl/maplibre";

export default function MapInteraction() {
    return (
        <>
            <NavigationControl position="top-left" />
            <ScaleControl />
        </>
    );
}
