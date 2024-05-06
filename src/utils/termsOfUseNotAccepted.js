import { DomainName } from 'utils/deploymentInfo';
import { termsOfUseKeys } from 'utils/constants';

const termsOfUseNotAccepted = (user, domainName) => {
  const notAccepted = Object.values(termsOfUseKeys).some((key) => user?.attributes[key] !== 'true');

  return notAccepted
    && (domainName === DomainName.BIOMAGE || domainName === DomainName.BIOMAGE_STAGING);
};

export default termsOfUseNotAccepted;
