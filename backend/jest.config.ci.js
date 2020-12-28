// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
const baseConfig = require("./jest.config");

module.exports = Object.assign(baseConfig, {
    testMatch: ["**/*.spec.ts"],
    coverageThreshold: {
        global: {
            branches: 75,
        },
    },
    coveragePathIgnorePatterns: baseConfig.coveragePathIgnorePatterns.concat([
        "test.ts",
    ]),
});
