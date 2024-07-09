const mockAnalysisIds = {
  readyToLaunch: '868f4a31-da46-41a9-b18a-16b91a58302b',
  newProject: 'b936b0d2-0443-4a9c-884e-78da1f6002eb',
  latestTest: '06076ad1-c8c8-42fb-a425-974288a364a5',
};
const mockSecondaryAnalyses = [
  {
    id: mockAnalysisIds.latestTest,
    name: 'latest test',
    description: '',
    refGenome: null,
    createdAt: '2024-07-04 15:27:37.846038+00',
    kit: null,
    chemistryVersion: null,
    notifyByEmail: true,
    sampleNames: null,
    numOfSublibraries: null,
    parfileList: {
      start_timeout: 1000,
    },
  },
  {
    id: mockAnalysisIds.readyToLaunch,
    name: 'ready to launch',
    description: '',
    refGenome: 'Mmul10',
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
  },
  {
    id: mockAnalysisIds.newProject,
    name: 'newProject',
    description: '',
    refGenome: null,
    createdAt: '2024-07-04 14:03:47.022592+00',
    kit: null,
    chemistryVersion: null,
    notifyByEmail: true,
    sampleNames: null,
    numOfSublibraries: null,
    parfileList: {
      start_timeout: 1000,
    },
  },
];

export {
  mockSecondaryAnalyses,
  mockAnalysisIds,
};
