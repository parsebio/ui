const mockGenesListData = ['A', 'B', 'C', 'D'];

// const mockGeneExpressionData = {
//   A: {
//     rawExpression: {
//       min: 0,
//       max: 6.8,
//       mean: 1.68,
//       stdev: 2.597331964,
//       expression: [0, 0, 0, 1.56, 0, 6.8, 3.4],
//     },
//     truncatedExpression: {
//       min: 0,
//       max: 6.8,
//       mean: 1.68,
//       stdev: 2.597331964,
//       expression: [0, 0, 0, 1.56, 0, 6.8, 3.4],
//     },
//   },
//   B: {
//     rawExpression: {
//       min: 0,
//       max: 6.8,
//       mean: 1.702857143,
//       stdev: 2.551115536,
//       expression: [0, 0, 0, 2.56, 0, 6.8, 2.56],
//     },
//     truncatedExpression: {
//       min: 0,
//       max: 6.8,
//       mean: 1.702857143,
//       stdev: 2.551115536,
//       expression: [0, 0, 0, 2.56, 0, 6.8, 2.56],
//     },
//   },
//   C: {
//     rawExpression: {
//       min: 0,
//       max: 3.4,
//       mean: 1.68,
//       stdev: 2.141525936,
//       expression: [0, 0, 0, 3.56, 0, 4.8, 3.4],
//     },
//     truncatedExpression: {
//       min: 0,
//       max: 3.4,
//       mean: 1.68,
//       stdev: 2.141525936,
//       expression: [0, 0, 0, 3.56, 0, 4.8, 3.4],
//     },
//   },
//   D: {
//     rawExpression: {
//       min: 0,
//       max: 6.8,
//       mean: 1.68,
//       stdev: 2.597331964,
//       expression: [0, 0, 0, 1.56, 0, 6.8, 3.4],
//     },
//     truncatedExpression: {
//       min: 0,
//       max: 6.8,
//       mean: 1.68,
//       stdev: 2.597331964,
//       expression: [0, 0, 0, 1.56, 0, 6.8, 3.4],
//     },
//   },
//   E: { hello: 'world' },
// };

const mockSeekFromS3 = jest.fn();

const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
const mockCacheRemove = jest.fn();
const mockCacheModule = {
  get: jest.fn((x) => mockCacheGet(x)),
  set: jest.fn((key, val) => mockCacheSet(key, val)),
  _remove: jest.fn((key) => mockCacheRemove(key)),
};

export {
  mockGenesListData,
  mockSeekFromS3,
  mockCacheModule,
  mockCacheGet,
  mockCacheSet,
  mockCacheRemove,
};
