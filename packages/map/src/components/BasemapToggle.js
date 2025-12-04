import React from "react";
import { useComponents, withWQ, createFallbackComponents } from "@wq/react";
import PropTypes from "prop-types";

const BasemapToggleFallback = {
    components: createFallbackComponents(
        ["ListItem", "RadioButton"],
        "@wq/material",
    ),
};

function BasemapToggle({ name, active, setActive }) {
    const { ListItem, RadioButton } = useComponents();
    return (
        <ListItem
            button
            dense
            disableGutters
            onClick={() => setActive(true)}
            icon={() => (
                <RadioButton
                    style={{ marginLeft: 9 }}
                    color="primary"
                    checked={active}
                    onPress={setActive}
                />
            )}
        >
            {name}
        </ListItem>
    );
}

BasemapToggle.propTypes = {
    name: PropTypes.string,
    active: PropTypes.bool,
    setActive: PropTypes.func,
};

export default withWQ(BasemapToggle, { fallback: BasemapToggleFallback });
