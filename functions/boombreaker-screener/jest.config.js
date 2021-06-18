// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // An array of file extensions your modules use
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],

    // A preset that is used as a base for Jest's configuration
    // preset: undefined,
    preset: "ts-jest",

    // Automatically reset mock state between every test
    resetMocks: true,

    // The test environment that will be used for testing
    testEnvironment: "node",

    testMatch: ["**/*.spec.ts"],

    // Indicates whether each individual test should be reported during the run
    verbose: false,
};
