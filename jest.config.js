module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  testMatch: ["**/*.spec.ts"],
  globals: {
    "ts-jest": {
      tsConfig: "./tsconfig.json"
    }
  },
  transform: {
    ".(ts|tsx)$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "js"],
  modulePathIgnorePatterns: ["bin", ".history"],
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/src/$1",
    "@tests/(.*)": "<rootDir>/tests/$1"
  },
  moduleDirectories: ["node_modules", "src"]
};
