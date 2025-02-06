import React from "react";
import { useComponents, withWQ, createFallbackComponents } from "@wq/react";
import { useMapReducer } from "../hooks.js";
import PropTypes from "prop-types";

const HighlightPopupFallback = {
    components: createFallbackComponents(
        ["Popup", "View", "ScrollView", "IconButton", "Text"],
        "@wq/material"
    ),
};

function HighlightPopup({ inMap }) {
    const { Popup, View, ScrollView, IconButton } = useComponents(),
        [{ highlight }, { clearHighlight }] = useMapReducer(),
        features = (highlight && highlight.features) || [];
    if (inMap) {
        return null;
    }
    return (
        <View style={{ position: "absolute", bottom: 0 }}>
            <Popup
                open={features.length > 0}
                onClose={clearHighlight}
                variant="persistent"
            >
                <IconButton
                    icon="close"
                    onClick={clearHighlight}
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        zIndex: 1,
                    }}
                />
                <ScrollView style={{ maxHeight: "33vh" }}>
                    {features.map((feature) => (
                        <HighlightContentWQ
                            key={feature.id}
                            feature={feature}
                        />
                    ))}
                </ScrollView>
            </Popup>
        </View>
    );
}

HighlightPopup.propTypes = {
    inMap: PropTypes.bool,
};

export default withWQ(HighlightPopup, { fallback: HighlightPopupFallback });

const HighlightContentFallback = {
    components: {
        DefaultPopup({ feature: { id, properties = {} } }) {
            const { Text } = useComponents();
            const label = properties.label || properties.name || id;
            return <Text>{label}</Text>;
        },
    },
};

function HighlightContent({ feature, inMap }) {
    const popupName = feature.popup
            ? `${feature.popup}-popup`
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

const HighlightContentWQ = withWQ(HighlightContent, {
    fallback: HighlightContentFallback,
});

export { HighlightContentWQ as HighlightContent };
