import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import downloadSingleFile from 'utils/data-management/downloadSampleFile';
import downloadFromUrl from 'utils/downloadFromUrl';

import SampleTech from 'const/enums/SampleTech';
import fake from '__test__/test-utils/constants';
import sampleFileType from 'utils/sampleFileType';

jest.mock('utils/downloadFromUrl');

enableFetchMocks();

describe('downloadFromUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fetchMock.resetMocks();
    fetchMock.doMock();
  });

  it('Downloads from url', async () => {
    const mockSignedUrl = 'mockDownloadUrl';

    fetchMock.mockResponse(JSON.stringify(mockSignedUrl));

    await downloadSingleFile(fake.EXPERIMENT_ID, fake.SAMPLE_ID, sampleFileType.FEATURES_10_X, SampleTech['10X']);

    expect(downloadFromUrl).toHaveBeenCalledWith(mockSignedUrl);
    expect(fetchMock.mock.calls).toMatchSnapshot();
  });
});
