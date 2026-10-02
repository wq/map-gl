import VectorTile from "./VectorTile.js";
import PropTypes from "prop-types";

export default function Geojson({
    name,
    url,
    data,
    style,
    color,
    icon,
    before,
    active,
}) {
    return (
        <VectorTile
            name={name}
            active={active}
            before={before}
            data={data || url}
            style={style}
            color={color}
            icon={icon}
        />
    );
}

Geojson.propTypes = {
    name: PropTypes.string,
    url: PropTypes.string,
    data: PropTypes.object,
    style: PropTypes.object,
    color: PropTypes.string,
    icon: PropTypes.string,
    before: PropTypes.string,
    active: PropTypes.bool,
};
