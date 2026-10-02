import eslintJs from "@eslint/js";
import globals from "globals";
import eslintReact from "@eslint-react/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        ignores: ["docs/.cache/**", "docs/public/**"],
    },
    {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        extends: [
            eslintJs.configs.recommended,
            eslintReact.configs.recommended,
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest,
                ...globals.node,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            "@eslint-react/static-components": "off",
            // TODO: Restore when we drop support for React <= 18
            "@eslint-react/no-context-provider": "off",
            "@eslint-react/no-use-context": "off",
        },
    },
    {
        files: ["docs/*.js", "docs/src/**/*.jsx"],
        rules: {
            "no-unused-vars": ["error", { varsIgnorePattern: "^React$" }],
        },
    },
]);
