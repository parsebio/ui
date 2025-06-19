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

// The updated versions of react - dnd seem to not have a compatible version
// of the testing libraries anymore, so trying anything with the old way of setting up tests
// (with wrapWithTestBackend from react-dnd-test-utils or similar options) breaks.

jest.mock('react-dnd', () => {
  const mockBackend = { /* add methods as needed for your tests */ };
  const mockManager = {
    getBackend: jest.fn(() => mockBackend),
    getMonitor: jest.fn(() => ({
      subscribeToStateChange: jest.fn(),
      subscribeToOffsetChange: jest.fn(),
      isDragging: jest.fn(() => false),
      getItemType: jest.fn(),
      getItem: jest.fn(),
      canDragSource: jest.fn(),
      canDropOnTarget: jest.fn(),
      getDropResult: jest.fn(),
      didDrop: jest.fn(),
      getInitialClientOffset: jest.fn(),
      getInitialSourceClientOffset: jest.fn(),
      getSourceClientOffset: jest.fn(),
      getClientOffset: jest.fn(),
      getDifferenceFromInitialOffset: jest.fn(),
      isOverTarget: jest.fn(() => false),
      getTargetIds: jest.fn(),
    })),
    getActions: jest.fn(() => ({
      beginDrag: jest.fn(),
      publishDragSource: jest.fn(),
      hover: jest.fn(),
      drop: jest.fn(),
      endDrag: jest.fn(),
    })),
    getRegistry: jest.fn(() => ({
      addSource: jest.fn(),
      addTarget: jest.fn(),
      removeSource: jest.fn(),
      removeTarget: jest.fn(),
    })),
  };
  return {
    useDrag: () => [{ isDragging: false, handlerId: 'mock', draggedItem: null }, jest.fn(), jest.fn()],
    useDrop: () => [{ isOver: false, canDrop: false, handlerId: 'mock' }, jest.fn()],
    useDragDropManager: () => mockManager,
    DndProvider: ({ children }) => children,
  };
});

jest.mock('react-dnd-multi-backend', () => ({
  TouchTransition: {},
  HTML5toTouch: {},
  DndProvider: ({ children }) => children,
  createTransition: jest.fn(),
  default: {},
}));

jest.mock('rdndmb-html5-to-touch', () => ({
  default: {},
  HTML5toTouch: {},
}));

beforeAll(async () => {
  // Add stuff that needs to run once, before all tests
  await preloadAll();
});

beforeEach(async () => {
  // Add stuff that needs to run before each test
});

// setImmediate is not available in JSDOM, only on node
// https://github.com/prisma/prisma/issues/8558#issuecomment-1006100001
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
