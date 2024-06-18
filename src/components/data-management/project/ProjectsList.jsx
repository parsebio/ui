import React, { useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Space, Skeleton } from 'antd';
import { VariableSizeList as List } from 'react-window';
import integrationTestConstants from 'utils/integrationTestConstants';
import ExperimentCard from './ExperimentCard';
import SecondaryAnalysisCard from './SecondaryAnalysisCard';
// This makes sure that all the projects can be viewed properly inside the list
// TODO : This has to be done properly in CSS
const windowMargin = 130;// px

const Row = ({
  // eslint-disable-next-line react/prop-types
  index, data, style, setSize, projectType,
}) => {
  const rowRef = useRef();
  const project = data[index];

  useEffect(() => {
    if (rowRef.current) {
      setSize(index, rowRef.current.getBoundingClientRect().height);
    }
  }, [setSize, index, project]);

  return (
    <Space style={{ ...style, width: '100%' }}>
      <div ref={rowRef}>
        {projectType === 'secondaryAnalyses'
          ? (<SecondaryAnalysisCard secondaryAnalysisId={project.id} />)
          : (
            <ExperimentCard key={project.id} experimentId={project.id} />
          )}
      </div>
    </Space>
  );
};

const ProjectsList = (props) => {
  const { height, filter, projectType } = props;
  const listRef = useRef();
  const sizeMap = useRef({});

  const projects = useSelector((state) => state[projectType]);
  const setSize = useCallback((index, size) => {
    sizeMap.current[index] = size + 5;
    //  if the height gets changed, we need to reset the heights
    // so that they are recalculated
    listRef.current.resetAfterIndex(index);
  }, []);

  const getSize = (index) => sizeMap.current[index] || 204; // default height if not yet measured

  const filteredProjects = projects.ids
    .map((id) => projects[id])
    .filter((exp) => (exp.name.match(filter) || exp.id.match(filter)));

  if (projects.meta.loading) {
    return ([...Array(5)].map((_, idx) => <Skeleton key={`skeleton-${idx}`} role='progressbar' active />));
  } if (filteredProjects.length === 0) {
    return (<div data-test-id={integrationTestConstants.ids.PROJECTS_LIST} />);
  }
  return (
    <div data-test-id={integrationTestConstants.ids.PROJECTS_LIST}>
      <List
        ref={listRef}
        height={height - windowMargin}
        width='100%'
        itemCount={filteredProjects.length}
        itemSize={getSize}
        itemData={filteredProjects}
      >
        {({ data, index, style }) => (
          <Row
            data={data}
            index={index}
            style={style}
            setSize={setSize}
            projectType={projectType}
          />
        )}
      </List>
    </div>
  );
};

ProjectsList.propTypes = {
  height: PropTypes.number,
  filter: PropTypes.object.isRequired,
  projectType: PropTypes.string.isRequired,
};

ProjectsList.defaultProps = {
  height: 800,
};

export default ProjectsList;
