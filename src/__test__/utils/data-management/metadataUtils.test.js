import { metadataKeyToName, metadataNameToKey } from 'utils/data-management/metadataUtils';

describe('MetadataKeyToName', () => {
  it('Formats metadata key properly', () => {
    const testMetadataKey = 'Metadata_1';
    expect(metadataKeyToName(testMetadataKey)).toEqual('Metadata 1');
  });
});

describe('metadataNameToKey', () => {
  it('It formats names properly', () => {
    const testProperName = 'Metadata 1';
    expect(metadataNameToKey(testProperName)).toEqual('Metadata_1');

    const aLotOfSpacesName = '  Metadata    2   ';
    expect(metadataNameToKey(aLotOfSpacesName)).toEqual('Metadata_2');
  });

  it('Returns empty string given empty string', () => {
    expect(metadataNameToKey('')).toEqual('');
  });
});
