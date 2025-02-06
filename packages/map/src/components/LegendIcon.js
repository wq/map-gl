import React from "react";
import { useComponents, withWQ, createFallbackComponent } from "@wq/react";
import PropTypes from "prop-types";

const LegendIconFallback = {
    components: {
        Img: createFallbackComponent("Img", "@wq/material"),
    },
};

function LegendIcon({ name, label }) {
    const { Img } = useComponents();
    return <Img src={name} alt={label} />;
}

LegendIcon.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
};

export default withWQ(LegendIcon, { fallback: LegendIconFallback });
