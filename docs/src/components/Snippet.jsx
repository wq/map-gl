import { useMemo } from "react";
import { Snippet as BaseSnippet } from "@wq/gatsby-components";
import { View } from "@wq/material";

const expoDeps = {
        dependencies: {
            "@maplibre/maplibre-react-native": "11.4.1",
            "@wq/map-gl": "3.0.0-alpha.3",
            "@wq/map-gl-native": "3.0.0-alpha.2",
            "@wq/material": "3.0.0-alpha.3",
            "@wq/material-native": "3.0.0-alpha.2",
            "@wq/react": "3.0.0-beta.1",
            "react-native-paper": "*",
            "react-native-safe-area-context": "*",
        },
    },
    stackblitz = {
        dependencies: {
            "@emotion/react": "^11.14.0",
            "@emotion/styled": "^11.14.1",
            "@mui/icons-material": "^9.4.0",
            "@mui/material": "^9.4.0",
            "@wq/map-gl": "^3.0.0-alpha.3",
            "@wq/map-gl-web": "^3.0.0-alpha.3",
            "@wq/material": "^3.0.0-alpha.3",
            "@wq/material-web": "^3.0.0-alpha.2",
            "@wq/react": "^3.0.0-beta.1",
            "maplibre-gl": "^6.11.2",
        },
        files: {
            "vite.config.js": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ["maplibre-gl"],
    },
});`,
        },
    };

const overrides = {
    components: {
        SnippetPreview({ height, children }) {
            return (
                <View
                    sx={{
                        height,
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        display: "flex",
                    }}
                >
                    {children}
                </View>
            );
        },
    },
};

export default function Snippet({ code, preview, name, description }) {
    const expo = useMemo(() => {
        return {
            ...expoDeps,
            code: code.replace(
                'import "maplibre-gl/dist/maplibre-gl.css";\n',
                "",
            ),
        };
    }, [code]);

    return (
        <BaseSnippet
            code={code}
            preview={preview}
            expo={expo}
            stackblitz={stackblitz}
            name={name}
            description={description}
            wq={overrides}
        />
    );
}
