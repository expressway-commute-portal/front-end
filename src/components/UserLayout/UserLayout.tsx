import React from 'react';
import {Button, Layout, Space, Typography} from 'antd';
import {FacebookFilled, GithubFilled} from '@ant-design/icons';

const {Content, Footer} = Layout;

const UserLayout = ({children}: {children: JSX.Element}) => {
  return (
    <Layout style={{border: ''}}>
      <Content style={{paddingTop: '20px'}}>{children}</Content>
      <Footer style={{textAlign: 'center'}}>
        <Space direction={'horizontal'}>
          <Button
            type="primary"
            shape="circle"
            icon={<FacebookFilled />}
            size={'large'}
            href={'https://www.facebook.com/groups/Highway.Bus.Sri.Lanka'}
            target={'_blank'}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<GithubFilled />}
            size={'large'}
            href={'https://github.com/expressway-commute-portal'}
            target={'_blank'}
          />
        </Space>
        <br />
        <br />
        <Typography.Text type={'secondary'} italic>
          Copyright © 2023 by Expressway Commute Portal. All Rights Reserved{' '}
        </Typography.Text>
      </Footer>
    </Layout>
  );
};

export default UserLayout;
