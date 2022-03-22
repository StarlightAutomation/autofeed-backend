module.exports = {
    "roots": [
        "<rootDir>/tests",
        "<rootDir>/src",
    ],
    "coverageReporters": ["lcov", "json-summary"],
    "collectCoverageFrom": [
        "src/**/*.ts",
    ],
    "testMatch": [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)",
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    "moduleNameMapper": {
        "@http/(.*)": "<rootDir>/src/http/$1",
        "@app/(.*)": "<rootDir>/src/$1",
        "@services/(.*)": "<rootDir>/src/services/$1",
    }
};
