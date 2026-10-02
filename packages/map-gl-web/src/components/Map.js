import { useMemo } from "react";
import { withWQ, useComponents } from "@wq/react";
import PropTypes from "prop-types";
import Root from "react-map-gl/maplibre";
import { useBasemapStyle } from "@wq/map";

const MapFallback = {
    components: {
        // eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix
        useMapReducer() {
            return [{ viewState: null }, { setViewState: null }];
        },
    },
};

function Map({
    // name,
    mapId,
    basemap,
    initialViewState,
    children,
    style,
    ...mapProps
}) {
    const { useMapReducer } = useComponents(),
        [{ viewState }, { setViewState }] = useMapReducer(),
        onMove = useMemo(() => {
            if (setViewState) {
                return (evt) => setViewState(evt.viewState);
            }
        }, [setViewState]),
        mapStyle = useBasemapStyle(basemap),
        containerStyle = useMemo(
            () => ({
                flex: "1",
                minHeight: 200,
                ...style,
            }),
            [style],
        );

    return (
        <Root
            id={mapId}
            reuseMaps={Boolean(mapId)}
            mapStyle={mapStyle}
            initialViewState={initialViewState}
            onMove={onMove}
            style={containerStyle}
            {...mapProps}
            {...viewState}
        >
            {children}
        </Root>
    );
}

Map.propTypes = {
    mapId: PropTypes.string,
    basemap: PropTypes.object,
    initialViewState: PropTypes.object,
    children: PropTypes.node,
    style: PropTypes.object,
};

export default withWQ(Map, { fallback: MapFallback });
