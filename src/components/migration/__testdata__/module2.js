/* eslint-disable import/no-dynamic-require */

const deepExtend = require("deep-extend");
const path = require("path");
const { some: someAs, one: OneAS } = require("./some-module");

const configPath = "../config";
const currentEnvironment = process.env.NODE_ENV || "development";
const allowedEnvironments = [
  "development",
  "stage",
  "beta",
  "test",
  "production"
];

const defaultConfig = {};
const { a: A, b: B } = defaultConfig;

if (allowedEnvironments.indexOf(currentEnvironment) === -1) {
  throw new Error(`Invalid NODE_ENV "${currentEnvironment}"`);
}

const environmentConfig = {};

module.exports = deepExtend({}, defaultConfig, environmentConfig);
