import React, {
  useContext, useState, useEffect,
} from 'react';
import propTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { modules } from 'utils/constants';

import { loadExperiments, setActiveExperiment, switchExperiment } from 'redux/actions/experiments';

import DataProcessingIntercept from 'components/data-processing/DataProcessingIntercept';
import loadSecondaryAnalyses from 'redux/actions/secondaryAnalyses/loadSecondaryAnalyses';
import setActiveSecondaryAnalysis from 'redux/actions/secondaryAnalyses/setActiveSecondaryAnalysis';

/**
 * AppRouteProvider provides a context which allows for checking and interception
 * of navigation between parts of the application. This allows implemenation of middlewares
 * when navigating between pages.
 *
 * AppRouteProvider wraps the application and exposes `useAppRouter`, which returns
 * an object containing the function `navigateTo`. The function takes in the path to be
 * go to and performs matching and determine actions which have to be carried out before
 * navigating to the route.
 *
 * Use `navigateTo` when implementing navigation between pages. Do not use `router.push` directly
 * as it will bypass the route checks and middlewares.
 */

const PATH_REGEX = {
  [modules.SECONDARY_ANALYSIS_OUTPUT]: '/secondary-analysis/\\[analysisId\\]/status',
  [modules.SECONDARY_ANALYSIS]: '/secondary-analysis',
  [modules.DATA_MANAGEMENT]: '/data-management',
  [modules.REPOSITORY]: '/repository',
  [modules.DATA_PROCESSING]: '/data-processing',
  [modules.DATA_EXPLORATION]: '/data-exploration',
  [modules.PLOTS_AND_TABLES]: '/plots-and-tables',
  [modules.SETTINGS]: '/settings',
  [modules.DEFAULT]: '/',
};

const PATHS = {
  [modules.SECONDARY_ANALYSIS]: `${PATH_REGEX[modules.SECONDARY_ANALYSIS]}`,
  [modules.SECONDARY_ANALYSIS_OUTPUT]: '/secondary-analysis/[analysisId]/status',
  [modules.DATA_MANAGEMENT]: `${PATH_REGEX[modules.DATA_MANAGEMENT]}`,
  [modules.REPOSITORY]: `${PATH_REGEX[modules.REPOSITORY]}`,
  [modules.DATA_PROCESSING]: `/experiments/[experimentId]${PATH_REGEX[modules.DATA_PROCESSING]}`,
  [modules.DATA_EXPLORATION]: `/experiments/[experimentId]${PATH_REGEX[modules.DATA_EXPLORATION]}`,
  [modules.PLOTS_AND_TABLES]: `/experiments/[experimentId]${PATH_REGEX[modules.PLOTS_AND_TABLES]}`,
  [modules.SETTINGS]: `${PATH_REGEX[modules.DATA_MANAGEMENT]} /[settingsName]`,
};

const AppRouterContext = React.createContext(null);

const AppRouteProvider = (props) => {
  const { children } = props;
  const router = useRouter();
  const dispatch = useDispatch();

  const [renderIntercept, setRenderIntercept] = useState(null);
  const [currentModule, setCurrentModule] = useState(module.DATA_MANAGEMENT);

  useEffect(() => {
    const [moduleName] = Object.entries(PATH_REGEX).find(
      ([, path]) => router.pathname.match(path),
    );

    setCurrentModule(moduleName);
  }, [router.pathname]);

  const changedQCFilters = useSelector(
    (state) => state.experimentSettings.processing.meta.changedQCFilters,
  );

  const availableIntercepts = {
    DATA_PROCESSING: (nextRoute) => (
      <DataProcessingIntercept
        onContinueNavigation={() => router.push(nextRoute)}
        onDismissIntercept={() => setRenderIntercept(null)}
      />
    ),
  };

  const handleRouteChange = async (previousRoute, module, params, ignoreIntercepts, hardLoad) => {
    const nextRoute = PATHS[module]
      .replace('[experimentId]', params.experimentId)
      .replace('[analysisId]', params.analysisId);

    if (nextRoute.match(PATH_REGEX.REPOSITORY)) {
      router.push(nextRoute);
      return;
    }

    if (
      previousRoute.match(PATH_REGEX.DATA_PROCESSING)
      && changedQCFilters.size > 0
      && !ignoreIntercepts
    ) {
      setRenderIntercept(availableIntercepts.DATA_PROCESSING(nextRoute));
      return;
    }

    if (previousRoute.match(PATH_REGEX.DATA_MANAGEMENT && nextRoute !== PATH_REGEX.SECONDARY_ANALYSIS)) {
      const { experimentId } = params;
      dispatch(switchExperiment(experimentId));
    }

    if (nextRoute.match(PATH_REGEX.SECONDARY_ANALYSIS)) {
      await dispatch(loadSecondaryAnalyses());

      // TODO check if this will be needed
      if (params.secondaryAnalysisId) {
        dispatch(setActiveSecondaryAnalysis(params.secondaryAnalysisId));
      }
    }

    if (nextRoute.match(PATH_REGEX.DATA_MANAGEMENT)) {
      await dispatch(loadExperiments());

      if (params.experimentId) {
        dispatch(setActiveExperiment(params.experimentId));
      }
    }
    if (hardLoad) {
      window.location = nextRoute;
    } else {
      router.push(nextRoute);
    }
  };

  const navigateTo = async (
    module,
    params = {},
    ignoreIntercepts = false,
    hardLoad = false,
  ) => handleRouteChange(router.pathname, module, params, ignoreIntercepts, hardLoad);

  return (
    <AppRouterContext.Provider value={{ navigateTo, currentModule }}>
      {renderIntercept ?? <></>}
      {children}
    </AppRouterContext.Provider>
  );
};

AppRouteProvider.propTypes = {
  children: propTypes.node.isRequired,
};

const useAppRouter = () => useContext(AppRouterContext);

export { useAppRouter, PATHS };
export default AppRouteProvider;
