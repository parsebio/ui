import '@testing-library/jest-dom/extend-expect';
import preloadAll from 'jest-next-dynamic';

import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('localforage');
jest.mock('utils/pushNotificationMessage');

// This is needed, because the unit tests don't register the Vitessce imports
jest.mock('components/data-exploration/DynamicVitessceWrappers', () => ({
  Scatterplot: () => 'Mocked Scatterplot',
  Heatmap: () => 'Mocked Heatmap',
}));

jest.mock('utils/work/downloadFromS3');

beforeAll(async () => {
  // Add stuff that needs to run once, before all tests
  await preloadAll();
});

beforeEach(async () => {
  // Add stuff that needs to run before each test
});
