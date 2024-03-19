import PreloadContent from 'components/PreloadContent';
import React, { useEffect, useCallback } from 'react';

import cache from 'utils/cache';

const { useAppRouter } = require('utils/AppRouteProvider');

const RedirectPage = () => {
  const { forceNavigateToUrl } = useAppRouter();

  const redirect = useCallback(async () => {
    let redirectUrl = await cache.get('redirectUrl');

    if (redirectUrl) {
      await cache.remove('redirectUrl');
    } else {
      redirectUrl = '/';
    }

    await forceNavigateToUrl(redirectUrl);
  });

  useEffect(() => {
    redirect();
  }, []);

  return <PreloadContent />;
};

export default RedirectPage;
