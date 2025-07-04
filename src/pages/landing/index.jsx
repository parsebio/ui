import React, { useEffect, useState } from 'react';
import {
  Card, Typography, Space, Button, Divider,
} from 'antd';
import { modules } from 'const';
import { useAppRouter } from 'utils/AppRouteProvider';

const { Title } = Typography;
const LandingPage = () => {
  const { navigateTo } = useAppRouter();
  const [shouldRenderLandingPage, setShouldRenderLandingPage] = useState(false);

  useEffect(() => {
    const fetchLastVisitedPage = async () => {
      const lastVisitedPage = await localStorage.getItem('lastVisitedPage');
      if (lastVisitedPage) {
        navigateTo(lastVisitedPage);
      } else {
        setShouldRenderLandingPage(true);
      }
    };
    fetchLastVisitedPage();
  }, []);

  if (shouldRenderLandingPage) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%',
      }}
      >
        <Space direction='vertical'>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <Title level={2}>Welcome to the Parse Biosciences cloud analysis platform!</Title>
          </div>
          <br />
          <Card
            style={{
              width: '100%',
              maxWidth: '900px',
            }}
            bordered
          >
            <Space direction='vertical' size='large'>
              <Title level={3}>
                I am a Parse Biosciences customer and I have
                Fastq files from a Parse Biosciences kit.
              </Title>
              <Space direction='horizontal'>
                <p>
                  The Pipeline module is where you can upload your Parse
                  Biosciences Fastq files for alignment to
                  your selected genome. The Pipeline module outputs
                  include a Quality Control report, downloadable
                  count matrices and automated integration with downstream Insights module.
                </p>
                <Button size='large' type='primary' onClick={() => navigateTo(modules.SECONDARY_ANALYSIS)}>Take me to Pipeline</Button>
              </Space>
              <Divider orientation='center'>OR</Divider>
              <Title level={3}>
                I have processed data files, such as Pipeline output
                files, count matrices or a Seurat object.
              </Title>
              <Space direction='horizontal'>
                <p>
                  The Insights module is where you can upload files that
                  have already been pre-processed. Supported
                  file types include: output files from the Pipeline module,
                  count matrices of multiple technology
                  types, H5 files, and Seurat objects.
                  Explore your data and generate publication-ready
                  figures with Insights!
                </p>
                <Button size='large' type='primary' onClick={() => navigateTo(modules.DATA_MANAGEMENT)}>Take me to Insights</Button>
              </Space>
            </Space>
          </Card>
        </Space>
      </div>
    );
  }
};

export default LandingPage;
