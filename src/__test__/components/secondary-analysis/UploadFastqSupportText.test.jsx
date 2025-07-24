import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import UploadFastqSupportText from 'components/secondary-analysis/UploadFastqSupportText';
import { isKitCategory } from 'const/enums/KitCategory';

jest.mock('utils/secondary-analysis/kitOptions', () => ({
  isKitCategory: jest.fn(),
}));

describe('UploadFastqSupportText', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders four-file guidance for TCR/BCR kits when pairedWt is true', () => {
    isKitCategory.mockReturnValue(true);
    render(<UploadFastqSupportText kit='anything' pairedWt />);

    expect(
      screen.getByText(/exactly four FASTQ files per sublibrary/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /1 pair of FASTQ files \(R1 and R2\) corresponding to the whole transcriptome data \(WT\)/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /1 pair of FASTQ files \(R1 and R2\) corresponding to the immune profiling data/i,
      ),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /this support article/i });
    expect(link).toHaveAttribute(
      'href',
      'https://support.parsebiosciences.com/hc/en-us/articles/33176662802708-How-to-handle-multiple-pairs-of-FASTQ-files-per-sublibrary',
    );

    expect(
      screen.getByText(/Uploading large FASTQ files can take multiple hours or even days\./i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/FASTQ files are deleted from Trailmaker 30 days after upload\./i),
    ).toBeInTheDocument();
  });

  it('renders two-file guidance for TCR/BCR kits when pairedWt is false', () => {
    isKitCategory.mockReturnValue(true);
    render(<UploadFastqSupportText kit='anything' />);

    expect(
      screen.getByText(/exactly two FASTQ files per sublibrary/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Drag and drop the immune profiling FASTQ files to the box below, then click Upload\./i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /this support article/i })).toBeInTheDocument();

    expect(
      screen.queryByText(/exactly four FASTQ files per sublibrary/i),
    ).toBeNull();
  });

  it('renders single-pair guidance for non-TCR/BCR kits', () => {
    isKitCategory.mockReturnValue(false);
    render(<UploadFastqSupportText kit='anything' />);

    expect(
      screen.getByText(/exactly one pair of FASTQ files \(R1 and R2\) per sublibrary\./i),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/exactly four FASTQ files per sublibrary/i),
    ).toBeNull();

    expect(
      screen.queryByText(/exactly two FASTQ files per sublibrary/i),
    ).toBeNull();

    expect(screen.getByRole('link', { name: /this support article/i })).toBeInTheDocument();
  });
});
