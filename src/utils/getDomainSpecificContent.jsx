import React from 'react';
import { AccountId, Environment } from 'utils/deploymentInfo';
import { Button } from 'antd';
import nextConfig from 'next/config';
import config from 'config';

const reusedContent = {
  HelpButton: {
    BiomageUserGuide: (
      <>
        Check out the
        {' '}
        <a href='https://www.biomage.net/user-guide' target='_blank' rel='noreferrer'>
          user guide
          {' '}
        </a>
        and
        {' '}
        <a href='https://www.youtube.com/@biomageltd4616/featured' target='_blank' rel='noreferrer'> tutorial videos </a>
        <br />
      </>
    ),
    OneToOneSupport: (
      <>
        For 1-2-1 support with your analysis, contact
        {' '}
        <a href={`mailto: ${config.supportEmail}`}>{config.supportEmail}</a>
      </>
    ),
  },
  ExtraLogoText: (
    <text
      style={{ outlineStyle: 'none' }}
      fontWeight='400'
      textRendering='geometricPrecision'
      fontFamily='IBM Plex Sans'
      fill='#F0F2F5'
      fontSize='9.00px'
      textAnchor='start'
      dominantBaseline='middle'
      y='20'
    >
      provided by Biomage
    </text>
  ),
};

const biomageContainerIds = {
  [Environment.PRODUCTION]: 'lkIodjnO',
  [Environment.STAGING]: 'FX7UBNS6',
  [Environment.DEVELOPMENT]: 'lS8ZRMXJ',
};

const domainSpecificContent = {
  HMS: {
    containerIds: {
      [Environment.PRODUCTION]: 'zdMhc9ey',
      [Environment.STAGING]: 'lMoIVl5D',
      [Environment.DEVELOPMENT]: 'uMEoPBAl',
    },
    HelpButton: reusedContent.HelpButton.OneToOneSupport,
    matomoName: 'cellenics',
    guidanceFileLink: 'https://drive.google.com/file/d/1VPaB-yofuExinY2pXyGEEx-w39_OPubO/view',
    helpMessage: () => (
      <>
        Email us to find out if we can support your data:
        <a href={`mailto:${config.supportEmail}`}>
          {config.supportEmail}
        </a>
      </>
    ),
  },
  BIOMAGE: {
    containerIds: biomageContainerIds,
    HelpButton: (
      <>
        Ask questions about how to use Cellenics and make feature requests on the
        {' '}
        <a href='https://community.biomage.net/' target='_blank' rel='noreferrer'>Cellenics community forum</a>
        !
        The Biomage team will reply to your message as soon as possible.
        <br />
        <br />
        {reusedContent.HelpButton.BiomageUserGuide}
      </>
    ),
    HeaderExtraButton: (
      <Button>
        <a href='https://courses.biomage.net' target='_blank' rel='noreferrer'>
          Courses
        </a>
      </Button>
    ),
    matomoName: 'biomage',
    ExtraLogoText: reusedContent.ExtraLogoText,
    guidanceFileLink: 'https://www.biomage.net/user-guide',
    helpMessage: (
      <>
        Reach out to us using the feedback button at the top of the page.
      </>
    ),
  },
  BIOMAGE_PRIVATE: {
    containerIds: biomageContainerIds,
    HelpButton: (
      <>
        {reusedContent.HelpButton.BiomageUserGuide}
      </>
    ),
    ExtraLogoText: reusedContent.ExtraLogoText,
    guidanceFileLink: 'https://www.biomage.net/user-guide',
    helpMessage: (
      <>
        Reach out to us using the feedback button at the top of the page.
      </>
    ),
  },
};

export default function getDomainSpecificContent(component) {
  const accountId = nextConfig()?.publicRuntimeConfig?.accountId;

  switch (accountId) {
    case AccountId.HMS:
      return domainSpecificContent.HMS[component];
    case AccountId.BIOMAGE:
      return domainSpecificContent.BIOMAGE[component];
    default:
      return domainSpecificContent.BIOMAGE_PRIVATE[component];
  }
}
