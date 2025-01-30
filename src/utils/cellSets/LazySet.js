/* eslint-disable no-underscore-dangle */
// Each of the sets added needs to be unique
class LazySet {
  constructor(startingSet = new Set(), assumeSetsAreDisjoint = true) {
    // Begins with a starting set which works as an "inner set"
    // where addition operations are performed
    this.sets = [startingSet];

    // If true, the set will assume any added sets don't share any values
    // This is useful for performance reasons
    // If set to false, the "size" operation will be fairly slow the first time it's called
    this.assumeSetsAreDisjoint = assumeSetsAreDisjoint;

    this._size = null;
  }

  has(value) {
    return this.sets.some((set) => set.has(value));
  }

  addSet(set, assumeNewSetIsDisjoint) {
    if (assumeNewSetIsDisjoint === undefined) {
      // This is a reliability measure to make sure we
      // don't begin using LazySet in ways that will break it
      //
      // You can use sets that share items no problem, but that will mean that calculating the size
      // won't be supported for the reasons explained in its getter's error message
      throw new Error('You need to explicitly aknowledge you know that the sets are disjoint or that they aren\'t');
    }

    this.assumeSetsAreDisjoint = this.assumeSetsAreDisjoint && assumeNewSetIsDisjoint;
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

  // eslint-disable-next-line class-methods-use-this
  clear() {
    throw new Error('This is a lazy set, it cannot be cleared');
  }

  forEach(callback) {
    this.sets.forEach((set) => {
      set.forEach((item) => callback(item));
    });
  }

  // This allows us to use operators like `...` and `for of`
  *[Symbol.iterator]() {
    // eslint-disable-next-line no-restricted-syntax, no-unused-vars
    for (const set of this.sets) {
      yield* set;
    }
  }

  // The only cell class that can have intersecting sets (not disjoint) is
  // scratchpad, which is not going to have more than one set in this.sets
  // so that case is safe
  get size() {
    if (!this.assumeSetsAreDisjoint && this.sets.length > 1) {
      throw new Error(`Size operation is not supported when inner sets are not disjoint and more than one
because it is very expensive and to discourage introducing performance issues unknowingly.
Instead of using size, create a Set from the LazySet and use the size property of the Set
`);
    }

    if (this._size === null) {
      this._size = this.sets.reduce((acc, set) => acc + set.size, 0);
    }

    return this._size;
  }

  // These were recently added and we haven't used them, so I am skipping on implementing them
  //
  // However, they can be easily implemented if you want
  // If you need one that is already implemented, make sure that it s correct before uncommenting it
  // About union, difference, etc. They could be implemented to return Sets or LazySets,
  // I didn't know what would be better so that's why I left them like this
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
