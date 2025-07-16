import FastqFileType from 'const/enums/FastqFileType';
import {
  getPairsForFiles,
  getMatchingPairFor,
  hasReadPair,
  getPairData,
} from 'utils/fastqUtils';

const { WT_FASTQ, IMMUNE_FASTQ } = FastqFileType;

describe('getPairData', () => {
  it('extracts name and readNumber from _R1', () => {
    const result = getPairData('sample_S1_R1.fastq.gz');
    expect(result).toEqual({ name: 'sample_S1', readNumber: 1 });
  });

  it('extracts name and readNumber from _R2', () => {
    const result = getPairData('sample_S1_R2.fq.gz');
    expect(result).toEqual({ name: 'sample_S1', readNumber: 2 });
  });
});

describe('getMatchingPairFor', () => {
  it('returns the matching pair for _R1', () => {
    expect(getMatchingPairFor('foo_S1_R1.fastq.gz')).toBe('foo_S1_R2.fastq.gz');
  });

  it('returns the matching pair for _R2', () => {
    expect(getMatchingPairFor('foo_S1_R2.fastq.gz')).toBe('foo_S1_R1.fastq.gz');
  });

  it('returns the matching pair for _1', () => {
    expect(getMatchingPairFor('foo_S1_1.fastq.gz')).toBe('foo_S1_2.fastq.gz');
  });

  it('returns the matching pair for _2', () => {
    expect(getMatchingPairFor('foo_S1_2.fastq.gz')).toBe('foo_S1_1.fastq.gz');
  });
});

describe('hasReadPair', () => {
  it('returns true for _R1', () => {
    expect(hasReadPair('foo_S1_R1.fastq.gz')).toBe(true);
  });

  it('returns true for _2', () => {
    expect(hasReadPair('foo_S1_2.fastq.gz')).toBe(true);
  });

  it('returns false for no read pair', () => {
    expect(hasReadPair('foo_S1.fastq.gz')).toBe(false);
  });
});

describe('getPairsForFiles', () => {
  it('returns correct sublibraries for paired files', () => {
    const files = {
      a: { id: 'a', name: 'foo_S1_R1.fastq.gz', type: WT_FASTQ },
      b: { id: 'b', name: 'foo_S1_R2.fastq.gz', type: WT_FASTQ },
      c: { id: 'c', name: 'tcr_foo_S1_1.fastq.gz', type: IMMUNE_FASTQ },
      d: { id: 'd', name: 'tcr_foo_S1_2.fastq.gz', type: IMMUNE_FASTQ },
    };

    const result = getPairsForFiles(files);
    expect(result).toEqual({
      [WT_FASTQ]: {
        foo_S1: ['a', 'b'],
      },
      [IMMUNE_FASTQ]: {
        tcr_foo_S1: ['c', 'd'],
      },
    });
  });

  it('throws if a pair is missing', () => {
    const files = {
      a: { id: 'a', name: 'foo_S1_R1.fastq.gz', type: WT_FASTQ },
    };
    expect(() => getPairsForFiles(files)).toThrow('Invalid number of files per sulibrary');
  });

  it(
    'returns the sublibraries ordered by read number no matter the order in which they are in the input',
    () => {
      const files = {
        c: { id: 'c', name: 'tcr_foo_S1_R1.fastq.gz', type: IMMUNE_FASTQ },
        d: { id: 'd', name: 'tcr_foo_S1_R2.fastq.gz', type: IMMUNE_FASTQ },
        b: { id: 'b', name: 'foo_S1_R2.fastq.gz', type: WT_FASTQ },
        a: { id: 'a', name: 'foo_S1_R1.fastq.gz', type: WT_FASTQ },
      };
      const result = getPairsForFiles(files);
      expect(result).toEqual({
        [WT_FASTQ]: {
          foo_S1: ['a', 'b'],
        },
        [IMMUNE_FASTQ]: {
          tcr_foo_S1: ['c', 'd'],
        },
      });
    },
  );

  it('throws if a pair is missing', () => {
    const files = {
      a: { id: 'a', name: 'foo_S1_R1.fastq.gz', type: WT_FASTQ },
    };
    expect(() => getPairsForFiles(files)).toThrow('Invalid number of files per sulibrary');
  });
});
