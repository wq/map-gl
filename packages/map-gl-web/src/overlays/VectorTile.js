import { useState, useEffect } from "react";
import { useStyleProp } from "@wq/map";
import { Source, Layer } from "react-map-gl/maplibre";
import PropTypes from "prop-types";

export default function VectorTile(props) {
    if (props.url) {
        return <UrlVectorTile {...props} />;
    } else {
        return <StyleVectorTile {...props} />;
    }
}

function StyleVectorTile(props) {
    const { sources, layers } = useStyleProp(props);
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

VectorTile.propTypes = {
    name: PropTypes.string,
    style: PropTypes.object,
    url: PropTypes.string,
    layer: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    color: PropTypes.string,
    icon: PropTypes.string,
    before: PropTypes.string,
    active: PropTypes.bool,
};
