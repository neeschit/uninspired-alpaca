// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: ["**/*.ts"],

    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",

    coveragePathIgnorePatterns: [
        "index.ts",
        "services/backtest",
        ".strategy.ts",
        ".d.ts",
        "build",
        "scripts",
        "libs/core-utils",
    ],

    // Indicates which provider should be used to instrument code for coverage
    coverageProvider: "v8",

    // An object that configures minimum threshold enforcement for coverage results
    coverageThreshold: {
        global: {
            branches: 80,
        },
    },

    // An array of file extensions your modules use
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],

    // A preset that is used as a base for Jest's configuration
    // preset: undefined,
    preset: "ts-jest",

    // Automatically reset mock state between every test
    resetMocks: true,

    // The test environment that will be used for testing
    testEnvironment: "node",

    testMatch: ["**/*.integration.test.ts", "**/*.spec.ts"],

    // Indicates whether each individual test should be reported during the run
    verbose: false,
};
