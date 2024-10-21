import { createSelector } from 'reselect';
import memoize from 'lru-memoize';

import _ from 'lodash';

const emptyParamsIngest = () => [];

const configureSelector = (inputSelector, params) => {
  // Case it's a normal selector
  if (inputSelector.func === undefined) return inputSelector;

  // Otherwise, configure it to receive the parameters
  const { func, paramsIngest = emptyParamsIngest } = inputSelector;
  return func(paramsIngest(...params));
};

// based on https://www.aarongreenwald.com/blog/redux-reselect-parameters
/**
 *
 * @param {*} selector The selector to memoize
 * @param {*} options an object with different configuration options:
 *        - inputSelectors: The selectors that prepare the input the selector will take,
 *          look at reselect's input selectors for more information:
 *          https://redux.js.org/usage/deriving-data-selectors#writing-memoized-selectors-with-reselect
 *          (identity by default)
 *        - maxCachedKeys: The amount of concurrent memoized selectors of this type
 *          with different parameters supported (4 by default)
 *        - comparisonOperator: The comparison operator to determine selector's keys,
 *          (_.isEqual by default)
 * @returns a memoized by params selector that also uses reselect
 */
const createMemoizedSelector = (
  selector,
  options = {},
) => {
  const {
    maxCachedKeys = 4,
    inputSelectors = [(state) => state],
    comparisonOperator = _.isEqual,
  } = options;

  let inputSelectorsArray = inputSelectors;
  if (!Array.isArray(inputSelectors)) {
    inputSelectorsArray = [inputSelectors];
  }

  const makerFunction = (...params) => createSelector(
    inputSelectorsArray.map((inputSelector) => configureSelector(inputSelector, params)),
    selector(...params),
  );

  return memoize(maxCachedKeys, comparisonOperator)(makerFunction);
};

export default createMemoizedSelector;
