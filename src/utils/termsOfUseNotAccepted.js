import _ from 'lodash';
import { DomainName } from 'utils/deploymentInfo';
import { termsOfUseCognitoKey, institutionCognitoKey } from 'const';

const termsOfUseNotAccepted = (user, domainName) => {
  const notAccepted = user?.attributes[termsOfUseCognitoKey] !== 'true';

  const institution = user?.attributes[institutionCognitoKey];
  const institutionNotSet = _.isNil(institution) || institution.length === 0;

  return (notAccepted || institutionNotSet)
    && (domainName === DomainName.BIOMAGE || domainName === DomainName.BIOMAGE_STAGING);
};

export default termsOfUseNotAccepted;
