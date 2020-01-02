import * as path from "path";
import * as fs from "fs";
import { migrate } from ".";

describe("Migration test suite", () => {
  describe("Export tests", () => {
    describe("When passing a commonjs single function module export", () => {
      it("Should replace module.exports with export", () => {
        const script = "module.exports = someFunction;";
        const expected = "export = someFunction;\n";
        expect(migrate(script)).toBe(expected);
      });
    });
    describe("When passing a commonjs single require module export", () => {
      it("Should replace module.exports with export", () => {
        const script = `module.exports.constants = require("./constants.js");`;
        const expected = `export const constants = require("./constants.js");\n`;
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a commonjs single object module export", () => {
      it("Should replace module.exports with export", () => {
        const script = "module.exports = { someProp: 'someValue' };";
        const expected = "export = { someProp: 'someValue' };\n";
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a commonjs multiple functions exports with same name", () => {
      it("Should remove commonjs export and export functions directly", () => {
        const script = `
      function someFunction(){}
      function someAnotherFunction (){}
      module.exports.someFunction = someFunction;
      module.exports.someAnotherFunction = someAnotherFunction;`;

        const expected = `
      export function someFunction(){}
      export function someAnotherFunction (){}\n`;
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a commonjs multiple const exports with same name", () => {
      it("Should remove commonjs export and export functions directly", () => {
        const script = `
      const someVar = {};
      const someAnotherVar = {};
      module.exports.someVar = someVar;
      module.exports.someAnotherVar = someAnotherVar;`;

        const expected = `
      export const someVar = {};
      export const someAnotherVar = {};\n`;
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a commonjs multiple functions exports with different names", () => {
      it("Should replace commonjs exports with const export", () => {
        const script = `
      function someFunction(){};
      function someAnotherFunction(){};
      module.exports.someFunction2 = someFunction;
      module.exports.someAnotherFunction2 = someAnotherFunction;`;

        const expected = `
      function someFunction(){};
      function someAnotherFunction(){};
      export const someFunction2 = someFunction;
      export const someAnotherFunction2 = someAnotherFunction;\n`;
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a commonjs multiple functions exports with different names", () => {
      it("Should remove same name exports and directly export functions and replace different name exports with const", () => {
        const script = `
      function someFunction(){};
      function someAnotherFunction(){};
      module.exports.someFunction = someFunction;
      module.exports.someAnotherFunction = someAnotherFunction;
      module.exports.someFunction2 = someFunction;
      module.exports.someAnotherFunction2 = someAnotherFunction;`;

        const expected = `
      export function someFunction(){};
      export function someAnotherFunction(){};
      export const someFunction2 = someFunction;
      export const someAnotherFunction2 = someAnotherFunction;\n`;
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a commonjs with all type of exports", () => {
      it("Should replace module.exports with export, remove same name exports and directly export functions and replace different name exports with const", () => {
        const script = `
      module.exports = {
        someProp: 'someValue'
      };
      function someFunction(){};
      function someAnotherFunction(){};
      module.exports.someFunction = someFunction;
      module.exports.someAnotherFunction = someAnotherFunction;
      module.exports.someFunction2 = someFunction;
      module.exports.someAnotherFunction2 = someAnotherFunction;`;

        const expected = `
      export = {
        someProp: 'someValue'
      };
      export function someFunction(){};
      export function someAnotherFunction(){};
      export const someFunction2 = someFunction;
      export const someAnotherFunction2 = someAnotherFunction;\n`;
        expect(migrate(script)).toBe(expected);
      });
    });
  });
  describe("Import tests", () => {
    describe("When passing a commonjs const require", () => {
      it("Should replace const with import", () => {
        const script = `const resource = require("../resource");`;
        const expected = `import resource = require("../resource");\n`;
        expect(migrate(script)).toBe(expected);
      });
    });
    describe("When passing a commonjs const require with property access", () => {
      it("Should not replace const with import", () => {
        const script = `const { Types } = require("mongoose").Schema;
const { createSchemaMethod } = require("./server/service/index");
const schema = require("mongoose").Schema;
const resource = require("../resource");`;
        const expected = `const { Types } = require("mongoose").Schema;
import { createSchemaMethod } from "./server/service/index";
const schema = require("mongoose").Schema;
import resource = require("../resource");\n`;
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a named commonjs const require", () => {
      it("Should replace const with import and '= require()' with from", () => {
        const script = `const { Industry } = require("../../../../models");
const { productLabelByProductId } = require("../../../../models/constants");`;
        const expected = `import { Industry } from "../../../../models";
import { productLabelByProductId } from "../../../../models/constants";\n`;
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a multi-line named commonjs const require", () => {
      it("Should replace const with import and '= require()' with from", () => {
        const script = fs.readFileSync(
          path.resolve(__dirname, "./__testdata__/module1.js"),
          "utf-8"
        );
        const expected = fs.readFileSync(
          path.resolve(__dirname, "./__testdata__/module1.ts"),
          "utf-8"
        );
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing imports with spread as members", () => {
      it("Should replace object spread to import as", () => {
        const script = `const { some: someAs, one: OneAS } = require("some-module");`;
        const expected = `import { some as someAs, one as OneAS } from "some-module";\n`;
        expect(migrate(script)).toBe(expected);
      });
      it("Should not replace object spread of non-require variables", () => {
        const script = `
        const { some: someAs, one: OneAS } = require("some-module");
        const { some: someAs, one: OneAS } = someVar;`;
        const expected = `
        import { some as someAs, one as OneAS } from "some-module";
        const { some: someAs, one: OneAS } = someVar;\n`;
        expect(migrate(script)).toBe(expected);
      });
      it("Should replace object spread to import as in js file", () => {
        const script = fs.readFileSync(
          path.resolve(__dirname, "./__testdata__/module2.js"),
          "utf-8"
        );
        const expected = fs.readFileSync(
          path.resolve(__dirname, "./__testdata__/module2.ts"),
          "utf-8"
        );
        expect(migrate(script)).toBe(expected);
      });
    });
  });
});
