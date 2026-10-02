import { useComponents, withWQ, createFallbackComponents } from "@wq/react";
import PropTypes from "prop-types";

const HighlightContentFallback = {
    components: {
        ...createFallbackComponents(["View", "Text"], "@wq/material"),
        DefaultPopup({ feature: { id, properties = {} } }) {
            const { View, Text } = useComponents();
            const label = properties.label || properties.name || id;
            return (
                <View>
                    <Text>{label}</Text>
                </View>
            );
        },
    },
};

function HighlightContent({ feature, inMap }) {
    const popupName =
            feature.popup && feature.popup !== true
                ? feature.popup
                : "default-popup",
        components = useComponents();

    let View = components[popupName];
    if (!View) {
        console.warn(`No component named ${popupName}, using default.`);
        View = components["default-popup"];
    }

    return <View feature={feature} inMap={inMap} />;
}

HighlightContent.propTypes = {
    feature: PropTypes.object,
    inMap: PropTypes.bool,
};

export default withWQ(HighlightContent, {
    fallback: HighlightContentFallback,
});
