import { useState, useEffect } from "react";
import { useStyleProp } from "@wq/map";
import { useContext } from "react";
import { MapContext } from "../hooks.js";
import {
    Layer,
    GeoJSONSource,
    ImageSource,
    RasterSource,
    RasterDEMSource,
    VectorSource,
} from "@maplibre/maplibre-react-native";
import PropTypes from "prop-types";

export default function VectorTile(props) {
    if (props.url) {
        return <UrlVectorTile {...props} />;
    } else {
        return <StyleVectorTile {...props} />;
    }
}

function StyleVectorTile(props) {
    const { sources, layers } = useStyleProp(props),
        { addLayers, removeLayers } = useContext(MapContext);

    useEffect(() => {
        addLayers(layers);
        return () => removeLayers(layers);
    }, [layers, addLayers, removeLayers]);

    return (
        <>
            {Object.entries(sources).map(([id, source]) => (
                <Source key={id} id={id} {...source} />
            ))}
            {layers.map((layer) => (
                <Layer key={layer.id} beforeId={props.before} {...layer} />
            ))}
        </>
    );
}

function UrlVectorTile({ url, ...rest }) {
    const [style, setStyle] = useState();
    useEffect(() => {
        async function loadStyle() {
            const response = await fetch(url),
                data = await response.json();
            setStyle(data);
        }
        loadStyle();
    }, [url]);

    if (style) {
        return <StyleVectorTile {...rest} style={style} />;
    } else {
        return null;
    }
}

export function Source({ type, ...props }) {
    switch (type) {
        case "geojson":
            return <GeoJSONSource {...props} />;
        case "image":
            return <ImageSource {...props} />;
        case "raster":
            return <RasterSource {...props} />;
        case "raster-dem":
            return <RasterDEMSource {...props} />;
        case "vector":
            return <VectorSource {...props} />;
        default:
            return null;
    }
}

VectorTile.propTypes = {
    name: PropTypes.string,
    style: PropTypes.object,
    url: PropTypes.string,
    layer: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    before: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
    active: PropTypes.bool,
};
