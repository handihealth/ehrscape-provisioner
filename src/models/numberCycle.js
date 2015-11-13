var NumberCycle = function(min, max, subCycles) {
  this.min = min;
  this.max = max;
  this.current = min;
  this.subCycles = subCycles;
}

NumberCycle.prototype.get = function() {
  var current = this.current;
  var next = this.current + 1;
  if (next > this.max) {
    next = this.min;
  }
  this.current = next;
  return { version: current, subVersions: this.subCycles[current-1] };
};

module.exports = NumberCycle;
