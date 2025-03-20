import SparseMap from 'utils/SparseMap';

describe('SparseMap', () => {
  let sparseMap;
  const sparseRow = {
    _index: [0, 2, 4],
    _values: [10, 20, 30],
  };
  const definedKeys = [1, 2, 3, 4, 5];

  beforeEach(() => {
    sparseMap = new SparseMap(sparseRow, definedKeys);
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(sparseMap.size).toBe(5);
    });
  });

  describe('get', () => {
    it('should return the correct value for existing keys', () => {
      expect(sparseMap.get(1)).toBe(10);
      expect(sparseMap.get(3)).toBe(20);
      expect(sparseMap.get(5)).toBe(30);
    });

    it('should return the sparsified value for non-existing keys', () => {
      expect(sparseMap.get(2)).toBe(0);
      expect(sparseMap.get(4)).toBe(0);
    });
  });

  describe('applyModifier', () => {
    it('should apply a modifier correctly', () => {
      sparseMap.applyModifier((value) => value * 2);

      expect(sparseMap.get(1)).toBe(20);
      expect(sparseMap.get(3)).toBe(40);
      expect(sparseMap.get(5)).toBe(60);
      expect(sparseMap.get(2)).toBe(0);
      expect(sparseMap.get(4)).toBe(0);
    });
  });

  describe('forEach', () => {
    it('should iterate correctly', () => {
      const entries = [];
      sparseMap.forEach((value, key) => {
        entries.push([key, value]);
      });

      expect(entries).toEqual([
        [1, 10],
        [2, 0],
        [3, 20],
        [4, 0],
        [5, 30],
      ]);
    });
  });

  describe('keys', () => {
    it('should return the correct keys', () => {
      expect(Array.from(sparseMap.keys())).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('iterator', () => {
    it('should implement the iterable protocol correctly', () => {
      const entries = Array.from(sparseMap);
      expect(entries).toEqual([
        [1, 10],
        [2, 0],
        [3, 20],
        [4, 0],
        [5, 30],
      ]);
    });
  });
});
