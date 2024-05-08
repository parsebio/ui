import { DomainName } from 'utils/deploymentInfo';
import termsOfUseKey from 'utils/constants';

const termsOfUseNotAccepted = (user, domainName) => {
  const notAccepted = user?.attributes[termsOfUseKey] !== 'true';

  return notAccepted
    && (domainName === DomainName.BIOMAGE || domainName === DomainName.BIOMAGE_STAGING);
};

export default termsOfUseNotAccepted;
