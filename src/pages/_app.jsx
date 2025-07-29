import '../../assets/nprogress.css';

import _ from 'lodash';
import '../index.css';

import Amplify, { Credentials } from '@aws-amplify/core';
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import Router, { useRouter } from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import { DefaultSeo } from 'next-seo';

import { wrapper } from 'redux/store';
import { useDispatch, useSelector } from 'react-redux';

import AppRouteProvider from 'utils/AppRouteProvider';
import ContentWrapper from 'components/ContentWrapper';
import TagManager from 'components/TagManager';
import { initTracking } from 'utils/tracking';

import UnauthorizedPage from 'pages/401';
import NotFoundPage from 'pages/404';
import Error from 'pages/_error';
import APIError from 'utils/errors/http/APIError';
import { brandColors, notAgreedToTermsStatus, cookiesAgreedCognitoKey } from 'const';

import 'antd/dist/antd.variable.min.css';
import { loadUser } from 'redux/actions/user';
import { setUpDispatch } from 'utils/http/fetchAPI';

ConfigProvider.config({
  theme: {
    primaryColor: brandColors.DARK_LILAC,
    infoColor: brandColors.STEEL_PINK,
    warningColor: brandColors.STEEL_PINK,
  },
});

const mockCredentialsForInframock = () => {
  Credentials.get = async () => ({
    expired: false,
    expireTime: null,
    refreshCallbacks: [],
    accessKeyId: 'asd', // pragma: allowlist secret
    secretAccessKey: 'asfdsa', // pragma: allowlist secret
    sessionToken: 'asdfasdf', // pragma: allowlist secret
  });

  Credentials.shear = async () => ({
    expired: false,
    expireTime: null,
    refreshCallbacks: [],
    accessKeyId: 'asd', // pragma: allowlist secret
    secretAccessKey: 'asfdsa', // pragma: allowlist secret
    sessionToken: 'asdfasdf', // pragma: allowlist secret
  });
};

NProgress.configure({ showSpinner: false });
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

Amplify.configure({
  ssr: true,
});

const addDashesToExperimentId = (experimentId) => experimentId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');

const WrappedApp = ({ Component, pageProps }) => {
  const { httpError, amplifyConfig, errorOrigin } = pageProps;

  const dispatch = useDispatch();

  setUpDispatch(dispatch);

  const router = useRouter();
  const { experimentId: urlExperimentId, secondaryAnalysisId } = router.query;

  // If the experimentId exists (we are not is data management) and
  // is the old version (without dashes), then add them
  const experimentId = !urlExperimentId || urlExperimentId.includes('-') ? urlExperimentId : addDashesToExperimentId(urlExperimentId);

  const experimentData = useSelector(
    (state) => (experimentId ? state.experimentSettings.info : {}),
    _.isEqual,
  );

  const [amplifyConfigured, setAmplifyConfigured] = useState(!amplifyConfig);

  const environment = useSelector((state) => state.networkResources.environment);
  const cookiesAgreed = useSelector((state) => (
    state?.user?.current?.attributes[cookiesAgreedCognitoKey] || false
  )) === 'true';

  useEffect(() => {
    initTracking(environment, cookiesAgreed);
  }, [cookiesAgreed, environment]);

  useEffect(() => {
    if (amplifyConfig && typeof window !== 'undefined') {
      if (amplifyConfig?.Auth?.cookieStorage) {
        delete amplifyConfig.Auth.cookieStorage;
      }

      Amplify.configure(amplifyConfig);

      if (environment === 'development') {
        mockCredentialsForInframock();
      }

      setAmplifyConfigured(true);
    }
  }, [amplifyConfig]);

  if (!amplifyConfigured) {
    return null;
  }

  const mainContent = () => {
    // If this is a not found error, show it without the navigation bar.
    if (Component === NotFoundPage) {
      return <Component {...pageProps} />;
    }

    // If there was an error querying the API, display an error state.
    if (httpError) {
      if (httpError === 404) {
        const projectType = errorOrigin === 'experiment' ? 'analysis' : 'pipeline run';
        return (
          <NotFoundPage
            title={`${projectType} doesn't exist`}
            subTitle={`We searched, but we couldn't find the ${projectType} you're looking for.`}
            hint='It may have been deleted by the project owner.'
          />
        );
      }

      if (httpError === 403) {
        if (errorOrigin === 'experiment') {
          return (
            <NotFoundPage
              title='Analysis not found'
              subTitle={'You don\'t have access to this analysis. The owner may have made it private.'}
              hint='If somebody gave you this link, they may need to invite you to their project.'
            />
          );
        }
        if (errorOrigin === 'secondaryAnalysis') {
          return (
            <NotFoundPage
              title='Pipeline run not found'
              subTitle={'Or you don\'t have access to it.'}
            />
          );
        }
      }
      if (httpError === notAgreedToTermsStatus) {
        dispatch(loadUser());
        return (
          <NotFoundPage
            title='Terms agreement required'
            subTitle='You cannot access your analysis in Trailmaker until you have agreed to our updated privacy policy.'
            hint='Go to Insights or Pipeline to accept the terms.'
            primaryActionText='Go to Insights or Pipeline'
          />
        );
      }

      if (httpError === 401) {
        return (
          <UnauthorizedPage
            title='Log in to continue'
            subTitle="We can't show you this page."
            hint='You may be able to view it by logging in.'
          />
        );
      }

      return <Error statusCode={httpError} />;
    }

    // Otherwise, load the page inside the content wrapper.
    return (
      <AppRouteProvider>
        <ContentWrapper
          routeExperimentId={experimentId}
          routeAnalysisId={secondaryAnalysisId}
          experimentData={experimentData}
        >
          <Component
            experimentId={experimentId}
            secondaryAnalysisId={secondaryAnalysisId}
            experimentData={experimentData}
            {...pageProps}
          />
        </ContentWrapper>
      </AppRouteProvider>
    );
  };

  return (
    <>
      <DefaultSeo
        titleTemplate='%s &middot; Trailmaker'
        defaultTitle='Trailmaker'
        description='Trailmaker turns your single cell datasets into meaningful biology. It’s free for academic researchers, and you get world-class quality analytical insight: simple data upload, data integration for batch effect correction, beautiful publication-quality figures, and much more.'
        openGraph={{
          type: 'website',
          locale: 'en_US',
          site_name: 'Trailmaker',
        }}
      />
      <TagManager
        cookiesAgreed={cookiesAgreed}
        environment={environment}
      />
      <ConfigProvider>
        {mainContent(Component, pageProps)}
      </ConfigProvider>
    </>
  );
};

/* eslint-disable global-require */
WrappedApp.getInitialProps = async ({ Component, ctx }) => {
  const {
    store, req, query, res, err,
  } = ctx;

  // If a render error occurs, NextJS bypasses the normal page rendering
  // and returns `_error.jsx` instead, returning these parameters
  if (err) { return { pageProps: { errorObject: err } }; }

  // Do nothing if not server-side
  if (!req) { return { pageProps: {} }; }

  const pageProps = Component.getInitialProps
    ? await Component.getInitialProps(ctx)
    : {};

  const promises = [];

  const { default: getEnvironmentInfo } = (await import('utils/ssr/getEnvironmentInfo'));
  promises.push(getEnvironmentInfo);

  const { default: getAuthenticationInfo } = (await import('utils/ssr/getAuthenticationInfo'));
  promises.push(getAuthenticationInfo);

  const results = await Promise.all(promises.map((f) => f(ctx, store)));
  const { amplifyConfig } = results[1];

  try {
    const { withSSRContext } = (await import('aws-amplify'));

    const { Auth } = withSSRContext(ctx);
    Auth.configure(amplifyConfig.Auth);

    if (query?.experimentId) {
      const { default: getExperimentInfo } = (await import('utils/ssr/getExperimentInfo'));
      await getExperimentInfo(ctx, store, Auth);
    }

    if (query?.secondaryAnalysisId) {
      const { default: getAnalysisInfo } = (await import('utils/ssr/getAnalysisInfo'));
      await getAnalysisInfo(ctx, store, Auth);
    }

    return { pageProps: { ...pageProps, amplifyConfig } };
  } catch (e) {
    console.error(e);

    if (!(e instanceof APIError)) {
      // eslint-disable-next-line no-ex-assign
      e = new APIError(500);
    }
    res.statusCode = e.statusCode;
    const errorOrigin = query?.experimentId ? 'experiment' : query?.secondaryAnalysisId ? 'secondaryAnalysis' : '';
    return {
      pageProps: {
        ...pageProps, amplifyConfig, httpError: e.statusCode || true, errorOrigin,
      },
    };
  }
};
/* eslint-enable global-require */

WrappedApp.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default wrapper.withRedux(WrappedApp);
