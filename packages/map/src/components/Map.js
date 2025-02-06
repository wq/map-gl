import React from "react";
import PropTypes from "prop-types";
import { useComponents, withWQ, createFallbackComponents } from "@wq/react";

const MapFallback = {
    components: createFallbackComponents(["View", "Text"], "@wq/material"),
};

function Map({ children }) {
    const { View, Text } = useComponents();
    return (
        <View style={{ flex: "1", minHeight: 200 }}>
            <Text>No map integration library loaded - install @wq/map-gl.</Text>
            {children}
        </View>
    );
}

Map.propTypes = {
    children: PropTypes.node,
};

export default withWQ(Map, { fallback: MapFallback });
