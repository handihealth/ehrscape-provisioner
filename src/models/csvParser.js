var fs = require('fs');
var csvParse = require('csv-parse');

var CsvParser = function(filePath) {
  this.filePath = filePath;
}

CsvParser.prototype.parse = function(callback) {
  fs.readFile(this.filePath, 'utf8', function(err, data) {
    if (err) throw err;
    csvParse(data, function(err, output) {
      callback(output);
    });
  });
};

module.exports = CsvParser;