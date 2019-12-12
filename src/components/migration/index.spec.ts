import { migrate } from ".";

describe("Migration test suite", () => {
  describe("Export tests", () => {
    describe("When passing a commonjs single function module export", () => {
      it("Should replace module.exports with export", () => {
        const script = "module.exports = someFunction;";
        const expected = "export = someFunction;";
        expect(migrate(script)).toBe(expected);
      });
    });
    describe("When passing a commonjs single require module export", () => {
      it("Should replace module.exports with export", () => {
        const script = `module.exports.constants = require("./constants.js");`;
        const expected = `export const constants = require("./constants.js");`;
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a commonjs single object module export", () => {
      it("Should replace module.exports with export", () => {
        const script = "module.exports = { someProp: 'someValue' };";
        const expected = "export = { someProp: 'someValue' };";
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a commonjs multiple functions exports", () => {
      it("Should remove commonjs export and export functions directly", () => {
        const script = `
      function someFunction(){}
      function someAnotherFunction(){}
      module.exports.someFunction = someFunction;
      module.exports.someAnotherFunction = someAnotherFunction;`;

        const expected = `
      export function someFunction(){}
      export function someAnotherFunction(){}`;
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
      export const someAnotherFunction2 = someAnotherFunction;`;
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
      export const someAnotherFunction2 = someAnotherFunction;`;
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
      export const someAnotherFunction2 = someAnotherFunction;`;
        expect(migrate(script)).toBe(expected);
      });
    });
  });
  describe("Import tests", () => {
    describe("When passing a commonjs const require", () => {
      it("Should replace const with import", () => {
        const script = `const resource = require("../resource");`;
        const expected = `import resource = require("../resource");`;
        expect(migrate(script)).toBe(expected);
      });
    });

    describe("When passing a named commonjs const require", () => {
      it("Should replace const with import and '= require()' with from", () => {
        const script = `const { Industry } = require("../../../../models");
const { productLabelByProductId } = require("../../../../models/constants");`;
        const expected = `import { Industry } from "../../../../models";
import { productLabelByProductId } from "../../../../models/constants";`;
        expect(migrate(script)).toBe(expected);
      });
    });
  });
});
