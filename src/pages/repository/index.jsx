import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadExampleExperiments } from 'redux/actions/experiments';
import RepositoryTable from 'components/repository/RepositoryTable';

const RepositoryPage = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.current);
  const exampleExperiments = useSelector((state) => state.experiments.meta?.exampleExperiments);

  useEffect(() => {
    dispatch(loadExampleExperiments());
  }, [user]);

  return (
    <RepositoryTable
      data={exampleExperiments}
    />
  );
};

export default RepositoryPage;
