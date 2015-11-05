var NumberCycle = require('../../src/models/numberCycle');

describe("NumberCycle", function() {

  var numberCycle;

  beforeEach(function() {
    numberCycle = new NumberCycle(1, 3);
  });

  it("should get the next number", function() {
    expect(numberCycle.get()).toBe(1);
    expect(numberCycle.get()).toBe(2);
    expect(numberCycle.get()).toBe(3);
    expect(numberCycle.get()).toBe(1);
  });

});
