import React from "react";
import { useComponents, withWQ, createFallbackComponents } from "@wq/react";
import PropTypes from "prop-types";

const MapLayerFallback = {
    components: createFallbackComponents(
        [
            "Table",
            "TableHead",
            "TableTitle",
            "TableBody",
            "TableRow",
            "TableCell",
        ],
        "@wq/material"
    ),
};

function MapLayers({ children }) {
    const { Table, TableHead, TableBody, TableRow, TableTitle } =
        useComponents();
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableTitle>Group</TableTitle>
                    <TableTitle>Name</TableTitle>
                    <TableTitle>Active</TableTitle>
                    <TableTitle>Detail</TableTitle>
                </TableRow>
            </TableHead>
            <TableBody>
                {React.Children.map(children, (element) => (
                    <MapLayer element={element} />
                ))}
            </TableBody>
        </Table>
    );
}
MapLayers.propTypes = {
    children: PropTypes.node,
};

export default withWQ(MapLayers, { fallback: MapLayerFallback });

export function MapLayer({ element }) {
    if (!element || !element.type) {
        return null;
    }
    const type = element.type.isAutoBasemap ? "Basemap" : "Overlay",
        { name, active } = element.props,
        { TableRow, TableCell } = useComponents();
    return (
        <TableRow>
            <TableCell>{type}</TableCell>
            <TableCell>{name}</TableCell>
            <TableCell>{active ? "Y" : "N"}</TableCell>
            <TableCell>{element}</TableCell>
        </TableRow>
    );
}

MapLayer.propTypes = {
    element: PropTypes.node,
};
