import { DomainName } from 'utils/deploymentInfo';
import { termsOfUseCognitoKey } from 'utils/constants';

const termsOfUseNotAccepted = (user, domainName) => {
  const notAccepted = user?.attributes[termsOfUseCognitoKey] !== 'true';

  return notAccepted
    && (domainName === DomainName.BIOMAGE || domainName === DomainName.BIOMAGE_STAGING);
};

export default termsOfUseNotAccepted;
