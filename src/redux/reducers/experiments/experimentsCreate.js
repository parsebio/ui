import { experimentTemplate } from 'redux/reducers/experiments/initialState';
import { accessRoles } from 'redux/selectors/getHasPermissions';

const experimentCreate = (state, action) => {
  const {
    experiment: {
      id, name, description, createdAt,
    },
  } = action.payload;

  const newExperiment = {
    ...experimentTemplate,
    id,
    name,
    description,
    createdAt,
    accessRole: accessRoles.OWNER,
  };

  return {
    ...state,
    ids: [...state.ids, newExperiment.id],
    [newExperiment.id]: newExperiment,
    meta: {
      ...state.meta,
      activeExperimentId: newExperiment.id,
      saving: false,
    },
  };
};

export default experimentCreate;
