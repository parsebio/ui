import { mockCellSets } from '__test__/test-utils/cellSets.mock';
import getCellSets from 'redux/selectors/cellSets/getCellSets';

describe('Get cell sets selector test', () => {
  it('should return store cellsets if available', () => {
    expect(getCellSets()(mockCellSets)).toMatchSnapshot();
  });

  it('should return default cell sets if unavailable', () => {
    expect(getCellSets()({})).toMatchSnapshot();
  });
});
