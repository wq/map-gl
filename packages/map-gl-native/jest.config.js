export default {
    preset: "jest-expo",
    setupFiles: ["./setup-jest.js"],
    testMatch: ["**/__tests__/**/*.js?(x)"],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },
    transformIgnorePatterns: [],
    moduleNameMapper: {
        "@wq/map-gl-native": "<rootDir>/src/index.js",
    },
};
