var QUnit = require("qunit");
var path = require("path");

QUnit.run({
    code: path.join(__dirname, "../icalendarParser.js"),
    tests: path.join(__dirname, "./unit/testICal.js")
});

QUnit.run({
    code: path.join(__dirname, "../CsvParser.js"),
    tests: path.join(__dirname, "./unit/testCSV.js")
});