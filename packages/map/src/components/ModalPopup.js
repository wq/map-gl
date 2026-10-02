import { Fragment } from "react";
import { useComponents, withWQ, createFallbackComponents } from "@wq/react";
import HighlightContent from "./HighlightContent.js";

const ModalPopupFallback = {
    components: {
        HighlightContent,
        ...createFallbackComponents(
            ["Popup", "View", "ScrollView", "IconButton"],
            "@wq/material",
        ),
    },
};

function ModalPopup({ data, onClose }) {
    const { Popup, View, ScrollView, IconButton, HighlightContent, Divider } =
            useComponents(),
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
                        <Fragment key={feature.id}>
                            {feature !== features[0] && <Divider />}
                            <HighlightContent feature={feature} inMap={false} />
                        </Fragment>
                    ))}
                </ScrollView>
            </Popup>
        </View>
    );
}

export default withWQ(ModalPopup, { fallback: ModalPopupFallback });
