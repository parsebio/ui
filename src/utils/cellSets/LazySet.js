// WARNING if you add any set to the LazySet, any
// deletion operation will affect the set you added too
class LazySet {
  constructor(modifiesExternalSets = false) {
    // Begins with an empty set which works as an "inner set"
    // where addition operations are performed
    this.sets = [new Set()];

    this.modifiesExternalSets = modifiesExternalSets;
  }

  addSet(set) {
    this.sets.push(set);
  }

  add(value) {
    this.sets[0].add(value);
  }

  has(value) {
    return this.sets.some((set) => set.has(value));
  }

  delete(value) {
    if (this.modifiesExternalSets) {
      this.sets[0].forEach((set) => set.delete(value));
    } else {
      throw new Error('Attempt to modify external sets in LazySet');
    }
  }

  clear() {
    if (this.modifiesExternalSets) {
      return this.sets.forEach((set) => set.clear());
    }
    throw new Error('Attempt to modify external sets in LazySet');
  }

  forEach(callback) {
    this.sets.forEach((set) => {
      set.forEach(callback);
    });
  }

  // This allows us to use operators like `...` and `for of`
  *[Symbol.iterator]() {
    // eslint-disable-next-line no-restricted-syntax, no-unused-vars
    for (const set of this.sets) {
      yield* set;
    }
  }
}

export default LazySet;
