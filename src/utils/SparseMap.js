/* eslint-disable no-underscore-dangle */

// This implements a very basic and sparse version of the Map
// Important, the "has" method shouldn't be used, it always returns true.
// This is to have a smaller footprint in memory
// because otherwise we'd need to store a set of which keys it does have
class SparseMap {
  constructor(sparseRow, sparsifiedValue = 0) {
    this.sparsifiedValue = sparsifiedValue;

    // sparseRow can come in format for a Map constructor, in that case just store inside the map
    if (Array.isArray(sparseRow)) {
      this.map = new Map(sparseRow);
      return;
    }

    // Assume sparseRow's format is a compressed column matrix of one column
    this.map = new Map();

    sparseRow._index.forEach((key, i) => {
      const value = sparseRow._values[i];
      this.map.set(key, value);
    });
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  has(_) {
    console.warn("This method shouldn't be used");
    return true;
  }

  get(key) {
    return this.map.get(key) ?? this.sparsifiedValue;
  }

  applyModifier(modifier) {
    this.map.forEach((value, key) => {
      this.map.set(key, modifier(value));
    });

    this.sparsifiedValue = modifier(this.sparsifiedValue);
  }
}

export default SparseMap;
