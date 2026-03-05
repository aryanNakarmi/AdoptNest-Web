import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Match YOUR tsconfig.json: "@/*" maps to "./*" (project root, NOT src/)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Handle ESM packages like react-icons, zod, @hookform
  transformIgnorePatterns: [
    "node_modules/(?!(react-icons|@hookform|zod)/)",
  ],

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/layout.tsx",
    "!src/**/page.tsx",
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

export default createJestConfig(config);