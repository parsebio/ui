import React from 'react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen, render, fireEvent, waitFor,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import initialExperimentState from 'redux/reducers/experiments/initialState';
import ProjectDeleteModal from 'components/data-management/project/ProjectDeleteModal';

const mockStore = configureMockStore([thunk]);
const experimentId = 'iamid';

const deleteProjectSpy = jest.fn();
const cancelProjectSpy = jest.fn();

const typesToDisplay = {
  experiments: 'project',
  secondaryAnalyses: 'run',
};

describe.each([
  { projectName: 'someExperiment', projectType: 'experiments' },
  { projectName: 'someAnalysis', projectType: 'secondaryAnalyses' },
])('ProjectDeleteModal $projectName, $projectType', ({ projectName, projectType }) => {
  const state = {
    experiments: {
      ...initialExperimentState,
      ids: [experimentId],
      [experimentId]: {
        name: projectName,
      },
      meta: {
        ...initialExperimentState.meta,
        loading: false,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderProjectDeleteModal = () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <ProjectDeleteModal
          projectName={projectName}
          projectType={projectType}
          onDelete={deleteProjectSpy}
          onCancel={cancelProjectSpy}
        />
      </Provider>,
    );
  };

  const typeToDisplay = typesToDisplay[projectType];

  it('has cancel and ok button', async () => {
    renderProjectDeleteModal();

    expect(screen.getByText(`Keep ${typeToDisplay}`)).toBeInTheDocument();
    expect(screen.getByText(`Permanently delete ${typeToDisplay}`)).toBeInTheDocument();
  });

  it('ok button is disabled by default', () => {
    renderProjectDeleteModal();
    expect(screen.getByText(`Permanently delete ${typeToDisplay}`).parentElement).toBeDisabled();
  });

  it('ok button is not disabled if project name is typed in', () => {
    renderProjectDeleteModal();

    const nameField = screen.getByRole('textbox');
    fireEvent.change(nameField, { target: { value: projectName } });

    expect(screen.getByText(`Permanently delete ${typeToDisplay}`).parentElement).toBeEnabled();
  });

  it('Calls delete on deletion', async () => {
    renderProjectDeleteModal();
    const nameField = screen.getByRole('textbox');
    fireEvent.change(nameField, { target: { value: projectName } });
    fireEvent.click(screen.getByText(`Permanently delete ${typeToDisplay}`).parentElement);
    await waitFor(() => expect(deleteProjectSpy).toHaveBeenCalled());
  });

  it('Calls cancel when delete is cancelled', async () => {
    renderProjectDeleteModal();
    fireEvent.click(screen.getByText(`Keep ${typeToDisplay}`));
    await waitFor(() => expect(cancelProjectSpy).toHaveBeenCalled());
  });

  it('Calls cancel when closed', async () => {
    renderProjectDeleteModal();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(cancelProjectSpy).toHaveBeenCalled());
  });
});
