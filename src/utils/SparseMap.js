/* eslint-disable no-underscore-dangle */

// This implements a very basic and sparse version of the Map
// Important, the "has" method shouldn't be used, it always returns true.
// This is to have a smaller footprint in memory
// because otherwise we'd need to store a set of which keys it does have
class SparseMap extends Map {
  #keys

  #sparsifiedValue

  #map

  constructor(sparseRow, definedKeys, keyAsString, sparsifiedValue = 0) {
    super();

    this.#sparsifiedValue = sparsifiedValue;

    this.#keys = keyAsString
      ? new Set(definedKeys.map((key) => key.toString()))
      : new Set(definedKeys);

    // sparseRow can come in format for a Map constructor, in that case just store inside the map
    if (Array.isArray(sparseRow)) {
      this.#map = new Map(sparseRow);
      return;
    }

    // Assume sparseRow's format is a compressed column matrix of one column
    this.#map = new Map();

    sparseRow._index.forEach((key, i) => {
      const definedKey = definedKeys[key];
      const value = sparseRow._values[i];

      const keyToSet = keyAsString ? definedKey.toString() : definedKey;
      this.#map.set(keyToSet, value);
    });
  }

  get size() {
    return this.#keys.size;
  }

  has(key) {
    return this.#keys.has(key);
  }

  get(key) {
    return this.#map.get(key) ?? this.#sparsifiedValue;
  }

  applyModifier(modifier) {
    this.#map.forEach((value, key) => {
      this.#map.set(key, modifier(value));
    });

    this.#sparsifiedValue = modifier(this.#sparsifiedValue);
  }

  forEach(callbackfn) {
    this.#keys.forEach((key) => {
      callbackfn(this.get(key), key, this);
    });
  }

  keys() {
    return this.#keys;
  }

  // Implement the iterable protocol
  [Symbol.iterator]() {
    const iterator = this.#keys.values();
    return {
      next: () => {
        const { value, done } = iterator.next();
        if (done) {
          return { value: undefined, done: true };
        }
        return { value: [value, this.get(value)], done: false };
      },
    };
  }
}

export default SparseMap;
