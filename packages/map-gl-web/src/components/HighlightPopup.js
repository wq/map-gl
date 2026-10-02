import { Fragment, useMemo } from "react";
import { Popup } from "react-map-gl/maplibre";
import { useComponents, withWQ, createFallbackComponents } from "@wq/react";
import { ModalPopup, HighlightContent } from "@wq/map";
import centroid from "@turf/centroid";

const HighlightPopupFallback = {
    components: {
        // eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix
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
        return <InMapPopupWQ data={data} onClose={onClose} />;
    } else {
        return <ModalPopup data={data} onClose={onClose} />;
    }
}

export default withWQ(HighlightPopup, { fallback: HighlightPopupFallback });

const InMapPopupFallback = {
    components: {
        HighlightContent,
        MapPopup: Popup,
        ...createFallbackComponents(["Divider"], "@wq/material"),
    },
};

function InMapPopup({ data, onClose }) {
    const dataIsEmpty = !data || !data.features || data.features.length === 0,
        [longitude, latitude] = useMemo(() => {
            if (dataIsEmpty) {
                return [null, null];
            }
            return centroid(data).geometry.coordinates;
        }, [data, dataIsEmpty]),
        { HighlightContent, Divider, MapPopup } = useComponents();

    if (dataIsEmpty) {
        return null;
    }

    return (
        <MapPopup
            latitude={latitude}
            longitude={longitude}
            onClose={onClose}
            maxWidth="80vw"
        >
            <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                {data.features.map((feature) => (
                    <Fragment key={feature.id}>
                        {feature !== data.features[0] && <Divider />}
                        <HighlightContent feature={feature} inMap />
                    </Fragment>
                ))}
            </div>
        </MapPopup>
    );
}

const InMapPopupWQ = withWQ(InMapPopup, { fallback: InMapPopupFallback });

export { InMapPopupWQ as InMapPopup };
