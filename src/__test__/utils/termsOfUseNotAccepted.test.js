import { DomainName } from 'utils/deploymentInfo';
import termsOfUseNotAccepted from 'utils/termsOfUseNotAccepted';

describe('termsOfUseNotAccepted', () => {
  it('Returns false for users that accepted privacy policy', () => {
    const user = {
      attributes: {
        'custom:agreed_terms_v2': 'true',
        'custom:institution': 'mockInstitution',
      },
    };
    const domainName = DomainName.BIOMAGE;

    expect(termsOfUseNotAccepted(user, domainName)).toEqual(false);
  });

  it('Returns false for users that arent in Biomage deployment', () => {
    const user = { attributes: {} };
    const domainName = 'Someotherdomain.com';

    expect(termsOfUseNotAccepted(user, domainName)).toEqual(false);
  });

  it('Returns true for users that still need to accept terms in Biomage', () => {
    const user = { attributes: {} };
    const domainName = DomainName.BIOMAGE;

    expect(termsOfUseNotAccepted(user, domainName)).toEqual(true);
  });

  it('Returns true for users that still need to accept terms in Biomage staging', () => {
    const user = { attributes: {} };
    const domainName = DomainName.BIOMAGE_STAGING;

    expect(termsOfUseNotAccepted(user, domainName)).toEqual(true);
  });
});
