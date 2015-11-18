var NumberCycle = require('../../src/models/numberCycle');

describe("NumberCycle", function() {

  var numberCycle;

  beforeEach(function() {
    numberCycle = new NumberCycle(1, 3, [[1,2,3,4,5,6], [1,2,3,4], [1,2,3,4,5]]);
  });

  it("should get the next number", function() {
    expect(numberCycle.get()).toEqual({ version: 1, subVersions: [ 1, 2, 3, 4, 5, 6 ] });
    expect(numberCycle.get()).toEqual({ version: 2, subVersions: [ 1, 2, 3, 4 ] });
    expect(numberCycle.get()).toEqual({ version: 3, subVersions: [ 1, 2, 3, 4, 5 ] });
    expect(numberCycle.get()).toEqual({ version: 1, subVersions: [ 1, 2, 3, 4, 5, 6 ] });
  });

});
