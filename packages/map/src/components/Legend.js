import React from "react";
import { useComponents, withWQ, createFallbackComponents } from "@wq/react";
import LegendIcon from "./LegendIcon.js";
import PropTypes from "prop-types";

const LegendFallback = {
    components: {
        LegendIcon,
        ...createFallbackComponents(["View", "Typography"], "@wq/material"),
    },
};

function Legend({ legend }) {
    const { View, Typography, LegendIcon } = useComponents();
    return (
        <View>
            {Object.entries(legend).map(([label, icon]) => (
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                    key={label}
                >
                    <Typography variant="caption" style={{ flex: 1 }}>
                        {label}
                    </Typography>
                    <View style={{ width: 48 }}>
                        <LegendIcon name={icon} label={label} />
                    </View>
                </View>
            ))}
        </View>
    );
}

Legend.propTypes = {
    legend: PropTypes.object,
};

export default withWQ(Legend, { fallback: LegendFallback });
