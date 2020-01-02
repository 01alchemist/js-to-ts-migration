/* eslint-disable import/no-dynamic-require */

import deepExtend = require("deep-extend");
import path = require("path");

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

if (allowedEnvironments.indexOf(currentEnvironment) === -1) {
  throw new Error(`Invalid NODE_ENV "${currentEnvironment}"`);
}

const environmentConfig = {};

export = deepExtend({}, defaultConfig, environmentConfig);
