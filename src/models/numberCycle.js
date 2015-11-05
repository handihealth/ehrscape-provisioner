var NumberCycle = function(min, max) {
  this.min = min;
  this.max = max;
  this.current = min;
}

NumberCycle.prototype.get = function() {
  var current = this.current;
  var next = this.current + 1;
  if (next > this.max) {
    next = this.min;
  }
  this.current = next;
  return current;
};

module.exports = NumberCycle;
