/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
    siteMetadata: {
        title: `@wq/map-gl`,
        siteUrl: `https://map-gl.wq.io`,
    },
    developMiddleware: (app) => {
        app.use((req, res, next) => {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            next();
        });
    },
    jsxRuntime: "automatic",
    plugins: [
        "gatsby-plugin-emotion",
        "gatsby-plugin-mdx",
        {
            resolve: "gatsby-source-filesystem",
            options: {
                name: "pages",
                path: "./src/pages/",
            },
            __key: "pages",
        },
    ],
};
