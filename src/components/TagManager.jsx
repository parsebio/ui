/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { getTrackingDetails } from 'utils/tracking';

const TagManager = ({ environment, cookiesAgreed }) => {
  const { enabled, containerId } = getTrackingDetails(environment);

  // If tracking is not enabled or cookies are not agreed to, don't add any tracking scripts.
  if (!enabled || !cookiesAgreed) return null;

  const matomoName = 'biomage';

  // Matomo tracking script
  const mtmTrackingCode = `var _mtm = window._mtm = window._mtm || [];
            _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src='https://cdn.matomo.cloud/${matomoName}.matomo.cloud/container_${containerId}.js'; s.parentNode.insertBefore(g,s);`;

  // Google Tag Manager script
  const gtagTrackingCode = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-HCJZZEB9WT');
  `;

  return (
    <Head>
      {/* Google Tag Manager Script */}
      <script async src='https://www.googletagmanager.com/gtag/js?id=G-HCJZZEB9WT' />
      <script key='gtag' dangerouslySetInnerHTML={{ __html: gtagTrackingCode }} />

      {/* Matomo Tracking Script */}
      <script key='mtm' dangerouslySetInnerHTML={{ __html: mtmTrackingCode }} />
    </Head>
  );
};

TagManager.propTypes = {
  environment: PropTypes.oneOf(['development', 'staging', 'production']).isRequired,
  cookiesAgreed: PropTypes.bool.isRequired,
};

export default TagManager;
