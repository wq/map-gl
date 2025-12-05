import React, { useMemo } from "react";
import { Popup } from "react-map-gl/maplibre";
import { useComponents, withWQ, createFallbackComponents } from "@wq/react";
import centroid from "@turf/centroid";
import PropTypes from "prop-types";

const HighlightPopupFallback = {
    components: {
        useMinWidth(width) {
            return window.screen.width >= width;
        },
        useShowInMap() {
            const { useMinWidth } = useComponents();
            return useMinWidth(600);
        },
    },
};

function HighlightPopup({ data, inMap, onClose }) {
    const { useShowInMap } = useComponents(),
        showInMap = useShowInMap();
    if (inMap && !showInMap) {
        return null;
    } else if (!inMap && showInMap) {
        return null;
    } else if (inMap) {
        return <InMapPopup data={data} onClose={onClose} />;
    } else {
        return <ModalPopupWQ data={data} onClose={onClose} />;
    }
}

export default withWQ(HighlightPopup, { fallback: HighlightPopupFallback });

export function InMapPopup({ data, onClose }) {
    const dataIsEmpty = !data || !data.features || data.features.length === 0,
        [longitude, latitude] = useMemo(() => {
            if (dataIsEmpty) {
                return [null, null];
            }
            return centroid(data).geometry.coordinates;
        }, [data]);

    if (dataIsEmpty) {
        return null;
    }

    return (
        <Popup
            latitude={latitude}
            longitude={longitude}
            onClose={onClose}
            maxWidth="80vw"
        >
            <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                {data.features.map((feature) => (
                    <HighlightContentWQ
                        key={feature.id}
                        feature={feature}
                        inMap
                    />
                ))}
            </div>
        </Popup>
    );
}

const ModalPopupFallback = {
    components: createFallbackComponents(
        ["Popup", "View", "ScrollView", "IconButton"],
        "@wq/material",
    ),
};

function ModalPopup({ data, onClose }) {
    const { Popup, View, ScrollView, IconButton } = useComponents(),
        features = (data && data.features) || [];
    return (
        <View style={{ position: "absolute", bottom: 0 }}>
            <Popup
                open={features.length > 0}
                onClose={onClose}
                variant="persistent"
            >
                <IconButton
                    icon="close"
                    onClick={onClose}
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

const ModalPopupWQ = withWQ(ModalPopup, { fallback: ModalPopupFallback });

export { ModalPopupWQ as ModalPopup };

const HighlightContentFallback = {
    components: {
        Text({ children }) {
            return <div>{children}</div>;
        },
        DefaultPopup({ feature: { id, properties = {} } }) {
            const { Text } = useComponents();
            const label = properties.label || properties.name || id;
            return <Text>{label}</Text>;
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

const HighlightContentWQ = withWQ(HighlightContent, {
    fallback: HighlightContentFallback,
});

export { HighlightContentWQ as HighlightContent };
