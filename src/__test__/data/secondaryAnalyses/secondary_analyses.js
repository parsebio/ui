const mockAnalysisIds = {
  readyToLaunch: '868f4a31-da46-41a9-b18a-16b91a58302b',
  newProject: 'b936b0d2-0443-4a9c-884e-78da1f6002eb',
  emptyAnalysis: '06076ad1-c8c8-42fb-a425-974288a364a5',
};
const mockSecondaryAnalyses = [
  {
    id: mockAnalysisIds.emptyAnalysis,
    name: 'latest test',
    description: '',
    refGenomeId: null,
    createdAt: '2024-07-04 15:27:37.846038+00',
    kit: null,
    chemistryVersion: null,
    notifyByEmail: true,
    sampleNames: null,
    numOfSublibraries: null,
    parfileList: {
      start_timeout: 1000,
    },
    status: {},
  },
  {
    id: mockAnalysisIds.readyToLaunch,
    name: 'ready to launch',
    description: '',
    refGenomeId: '421c3887-bb07-46a4-bbec-f84bb5b00a94',
    createdAt: '2024-07-02 15:59:34.868158+00',
    kit: 'wt',
    chemistryVersion: '2',
    notifyByEmail: true,
    sampleNames: [
      'sample_1',
      'sample_2',
      'sample_3',
    ],
    numOfSublibraries: 2,
    parfileList: {
      start_timeout: 1000,
    },
    status: {},
  },
  {
    id: mockAnalysisIds.newProject,
    name: 'newProject',
    description: '',
    refGenomeId: null,
    createdAt: '2024-07-04 14:03:47.022592+00',
    kit: null,
    chemistryVersion: null,
    notifyByEmail: true,
    sampleNames: null,
    numOfSublibraries: null,
    parfileList: {
      start_timeout: 1000,
    },
    status: {},
  },
];

export {
  mockSecondaryAnalyses,
  mockAnalysisIds,
};
