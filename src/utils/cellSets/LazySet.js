// WARNING if you add any set to the LazySet, any
// deletion operation will affect the set you added too
class LazySet {
  constructor(modifiesExternalSets = false, startingSets = []) {
    // Begins with an empty set which works as an "inner set"
    // where addition operations are performed
    this.sets = [new Set(), ...startingSets];

    this.modifiesExternalSets = modifiesExternalSets;
  }

  has(value) {
    return this.sets.some((set) => set.has(value));
  }

  addSet(set) {
    this.sets.push(set);
  }

  add(value) {
    this.sets[0].add(value);
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

  // These can be easily implemented but I didn't because we don't need them anywhere right now
  //
  // If you need one, check on the implemented ones that they are correct before uncommenting them
  // About union, difference, etc. They could be implemented to return Sets or LazySets,
  // I didn't know what would be better so that's why I left them like this
  //
  //
  // isDisjointFrom(otherSet) {
  //   return !this.some((value) => otherSet.has(value));
  // }
  //
  // difference(otherSet) {
  // }
  //
  // entries() {
  // }
  //
  // intersection(otherSet) {
  // }
  //
  // isSubsetOf(otherSet) {
  //   return this.every((value) => otherSet.has(value));
  // }
  //
  // isSupersetOf(otherSet) {
  //   return otherSet.every((value) => this.has(value));
  // }
  //
  // keys() {
  //   return this.values();
  // }
  //
  // symmetricDifference(otherSet) {
  //   const result = new Set(this);
  //   otherSet.forEach((value) => {
  //     if (result.has(value)) {
  //       result.delete(value);
  //     } else {
  //       result.add(value);
  //     }
  //   });
  //   return result;
  // }
  //
  // union(otherSet) {
  //   return new Set([...this, ...otherSet]);
  // }
  //
  // values() {
  //   return [...this];
  // }
}

export default LazySet;
