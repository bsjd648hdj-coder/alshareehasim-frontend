/** @type {import('jest').Config} */
const path = require("path");

const config = {
  testEnvironment: "jsdom",
  rootDir: path.resolve(__dirname),
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: { jsx: "react-jsx", esModuleInterop: true, strict: false },
    }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^~/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
    // Alias مباشر لكل مجلد مهم — يحل مشكلة Windows paths
    "^../../app/(.*)$": "<rootDir>/app/$1",
    "^../../../app/(.*)$": "<rootDir>/app/$1",
    "^../../../../app/(.*)$": "<rootDir>/app/$1",
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.(ts|tsx)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

module.exports = config;
