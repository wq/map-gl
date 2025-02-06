import React from "react";
import PropTypes from "prop-types";
import { createFallbackComponent, useComponents, withWQ } from "@wq/react";
import { useDataProps } from "../hooks.js";

const AutoOverlayFallback = {
    components: {
        Text: createFallbackComponent("Text", "@wq/material"),
        GeojsonOverlay({ url, data }) {
            const { Text } = useComponents();
            if (data) {
                return <Text>GeoJSON {data.type}</Text>;
            } else {
                return <Text>GeoJSON at {url}</Text>;
            }
        },
        TileOverlay({ url }) {
            const { Text } = useComponents();
            return <Text>Tile at {url}</Text>;
        },
        VectorTileOverlay({ url }) {
            const { Text } = useComponents();
            return <Text>Vector Tile at {url}</Text>;
        },
    },
};

function AutoOverlay({ type, data, context, ...conf }) {
    const components = useComponents(),
        Overlay = components[`${type}-overlay`] || components[type],
        dataProps = useDataProps(data, context);

    if (type === "empty") {
        return Overlay ? <Overlay active={conf.active} /> : null;
    } else if (type === "group") {
        const Group = Overlay || React.Fragment;
        return (
            <Group>
                {conf.layers.map((layer) => (
                    <AutoOverlay
                        key={layer.name}
                        active={conf.active}
                        context={context}
                        {...layer}
                    />
                ))}
            </Group>
        );
    } else if (!Overlay) {
        console.warn(`Skipping unrecognized layer type "${type}"`);
        return null;
    }

    return <Overlay {...conf} {...dataProps} />;
}
AutoOverlay.propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    context: PropTypes.object,
};

export default withWQ(AutoOverlay, { fallback: AutoOverlayFallback });
