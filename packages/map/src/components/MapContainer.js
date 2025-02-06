import React from "react";
import { useComponents, withWQ, createFallbackComponent } from "@wq/react";
import PropTypes from "prop-types";

const MapContainerFallback = {
    components: {
        View: createFallbackComponent("View", "@wq/material"),
    },
};

function MapContainer({ children }) {
    const { View } = useComponents();
    return (
        <View
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
                position: "relative",
            }}
        >
            {children}
        </View>
    );
}

MapContainer.propTypes = {
    children: PropTypes.node,
};

export default withWQ(MapContainer, {
    fallback: MapContainerFallback,
});
