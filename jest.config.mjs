/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    testEnvironment: "node",
    transform: {
      "^.+\\.tsx?$": ["ts-jest", {}], // Escaping "."
    },
    moduleNameMapper: {
      '(.+)\\.js': '$1',
    },
    testMatch: ["**/test/**/*.test.ts", "**/test/**/*.ts"],
  };
  
  