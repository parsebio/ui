import LazySet from 'utils/cellSets/LazySet';

describe('LazySet', () => {
  let lazySet;
  let set1;
  let set2;

  beforeEach(() => {
    set1 = new Set([1, 2, 3]);
    set2 = new Set([4, 5, 6]);
    lazySet = new LazySet(set1);
  });

  it('should initialize with a starting set', () => {
    expect(lazySet.has(1)).toBe(true);
    expect(lazySet.has(4)).toBe(false);
  });

  it('should add a new set', () => {
    lazySet.addSet(set2, true);
    expect(lazySet.has(4)).toBe(true);
  });

  it('should add a value to the starting set', () => {
    lazySet.add(7);
    expect(lazySet.has(7)).toBe(true);
  });

  it('should throw an error when deleting a value if modifiesExternalSets is false', () => {
    expect(() => lazySet.delete(1)).toThrow('Attempt to modify external sets in LazySet');
  });

  it('should throw an error when clearing the set', () => {
    expect(() => lazySet.clear()).toThrow('This is a lazy set, it cannot be cleared');
  });

  it('should iterate over all values', () => {
    lazySet.addSet(set2, true);
    const values = [...lazySet];
    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should calculate size when sets are disjoint', () => {
    lazySet.addSet(set2, true);
    expect(lazySet.size).toBe(6);
  });

  it('should throw an error when calculating size if sets are not disjoint', () => {
    lazySet.addSet(new Set([1, 2, 3, 4, 5]), false);
    expect(() => lazySet.size).toThrow('Size operation is not supported when sets are not disjoint');
  });

  it('should call a callback for each value when using forEach', () => {
    const callback = jest.fn();
    lazySet.forEach(callback);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(1);
    expect(callback).toHaveBeenCalledWith(2);
    expect(callback).toHaveBeenCalledWith(3);
  });
});
