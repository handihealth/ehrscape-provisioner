var CsvParser = require('../../src/models/csvParser');

describe("CsvParser", function() {

  var csvParser;

  beforeEach(function() {
    csvParser = new CsvParser('spec/assets/data/patients.csv');
  });

  it("should return the file path", function() {
    expect(csvParser.filePath).toBe('spec/assets/data/patients.csv');
  });

  describe("CsvParser parsing", function() {

    var csvData;

    beforeEach(function(done) {
      csvParser.parse(function(data) {
        csvData = data;
        done();
      });
    });

    it("should have the correct length", function() {
      expect(csvData.length).toBe(3);
    });

    it("should have the correct data", function() {
      var expected = [ '1', 'Mr', 'Ivor', 'Cox', '6948 Et St.', 'Halesowen', 'Worcestershire', 'VX27 5DV', '011981 32362', '06/06/44', 'Male', '9999999000', '352541', '1', '1' ];
      expect(csvData[1]).toEqual(expected);
    });

  });

});