module.exports = {
    plugins: [
        [
            "@babel/plugin-transform-react-jsx",
            { useSpread: true, runtime: "automatic" },
        ],
        function annotatePure() {
            return {
                visitor: {
                    CallExpression(path) {
                        if (
                            path.node.callee.type === "Identifier" &&
                            path.node.callee.name === "withWQ"
                        ) {
                            path.addComment("leading", "#__PURE__");
                        }
                    },
                },
            };
        },
    ],
    env: {
        test: {
            presets: [
                ["@babel/preset-env", { targets: { node: "current" } }],
                "@babel/preset-react",
            ],
        },
    },
};
