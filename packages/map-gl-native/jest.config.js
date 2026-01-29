export default {
    preset: "jest-expo",
    setupFiles: ["./setup-jest.js"],
    testMatch: ["**/__tests__/**/*.js?(x)"],
    transformIgnorePatterns: [],
    moduleNameMapper: {
        "@wq/map-gl-native": "<rootDir>/src/index.js",
    },
};
