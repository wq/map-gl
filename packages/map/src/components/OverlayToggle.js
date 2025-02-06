import React from "react";
import { useComponents, withWQ, createFallbackComponents } from "@wq/react";
import PropTypes from "prop-types";
import Legend from "./Legend.js";

const OverlayToggleFallback = {
    components: {
        Legend,
        ...createFallbackComponents(["ListItem", "Switch"], "@wq/material"),
    },
};

function OverlayToggle({ name, legend, active, setActive }) {
    const { ListItem, Switch, Legend } = useComponents();
    return (
        <ListItem
            button
            dense
            disableGutters
            style={{ alignItems: "start" }}
            onClick={() => setActive(!active)}
            icon={() => (
                <Switch
                    color="primary"
                    checked={active}
                    onValueChange={setActive}
                />
            )}
            description={active && legend ? <Legend legend={legend} /> : null}
        >
            {name}
        </ListItem>
    );
}

OverlayToggle.propTypes = {
    name: PropTypes.string,
    legend: PropTypes.object,
    active: PropTypes.bool,
    setActive: PropTypes.func,
};

export default withWQ(OverlayToggle, { fallback: OverlayToggleFallback });
