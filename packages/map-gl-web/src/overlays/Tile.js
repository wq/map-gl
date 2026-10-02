import PropTypes from "prop-types";
import VectorTile from "./VectorTile.js";
import { useBasemapStyle } from "@wq/map";

export default function Tile({
    name,
    active,
    url,
    tileSize,
    layout,
    paint,
    before,
}) {
    const style = useBasemapStyle({
        name,
        type: "tile",
        url,
        tileSize,
        layout,
        paint,
    });
    return (
        <VectorTile name={name} active={active} style={style} before={before} />
    );
}

Tile.propTypes = {
    name: PropTypes.string,
    active: PropTypes.bool,
    url: PropTypes.string,
    tileSize: PropTypes.number,
    layout: PropTypes.object,
    paint: PropTypes.object,
    before: PropTypes.string,
};
