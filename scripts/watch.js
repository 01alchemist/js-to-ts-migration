const [$1, $2] = process.argv;
process.argv = [$1, $2, "--colors", "--watch", "--progress"];
require("../node_modules/.bin/webpack");
