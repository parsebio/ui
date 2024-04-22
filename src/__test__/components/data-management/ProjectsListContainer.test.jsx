import '@testing-library/jest-dom';
import '__test__/test-utils/setupTests';

import { render, screen } from '@testing-library/react';

import ProjectsListContainer from 'components/data-management/project/ProjectsListContainer';
import { Provider } from 'react-redux';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { makeStore } from 'redux/store';
import userEvent from '@testing-library/user-event';

const mockNavigateTo = jest.fn();

jest.mock('utils/AppRouteProvider', () => ({
  useAppRouter: jest.fn(() => ({
    navigateTo: mockNavigateTo,
  })),
}));

describe.each([
  { projectType: 'experiments' },
  { projectType: 'secondaryAnalyses' },
])('ProjectsList $projectType', ({ projectType }) => {
  let storeState;

  beforeEach(() => {
    storeState = makeStore();
  });

  it('Contains the input box and create project button', async () => {
    const onCreateNewProjectMock = jest.fn();

    render(
      <Provider store={storeState}>
        <ProjectsListContainer
          projectType={projectType}
          onCreateNewProject={onCreateNewProjectMock}
        />
      </Provider>,
    );

    const filterByTextRegex = projectType === 'experiments' ? /Filter by project name/i : /Filter by run name or run ID/i;
    const createNewRegex = projectType === 'experiments' ? /Create New Project/i : /Create New Run/i;

    expect(screen.getByPlaceholderText(filterByTextRegex)).toBeDefined();
    expect(screen.getByText(createNewRegex)).toBeDefined();
  });

  it('triggers onCreateNewProject on clicking create new project button', async () => {
    const onCreateNewProjectMock = jest.fn();

    render(
      <Provider store={storeState}>
        <ProjectsListContainer
          projectType={projectType}
          onCreateNewProject={onCreateNewProjectMock}
        />
      </Provider>,
    );

    const createNewProjectButton = screen.getByText(/Create New Project/);

    expect(onCreateNewProjectMock).toHaveBeenCalledTimes(0);

    await act(async () => {
      userEvent.click(createNewProjectButton);
    });
    userEvent.click(screen.getByText('Upload Project'));

    expect(onCreateNewProjectMock).toHaveBeenCalledTimes(1);
  });

  it('navigates to repository page when selecting the option in the create project dropdown', async () => {
    const onCreateNewProjectMock = jest.fn();

    render(
      <Provider store={storeState}>
        <ProjectsListContainer
          projectType={projectType}
          onCreateNewProject={onCreateNewProjectMock}
        />
      </Provider>,
    );

    const createNewProjectButton = screen.getByText(/Create New Project/);

    await act(async () => {
      userEvent.click(createNewProjectButton);
    });
    userEvent.click(screen.getByText('Select from Dataset Repository'));

    expect(mockNavigateTo.mock.calls).toMatchSnapshot();
  });
});
