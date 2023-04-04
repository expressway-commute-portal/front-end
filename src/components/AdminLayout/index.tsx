import React, {useState} from 'react';
import {Button, Layout, Menu, MenuProps, Space, Typography} from 'antd';
import {Link, useLocation} from 'react-router-dom';
import './index.css';
import {useAuthStore} from '../../store/auth.store';
import {FacebookFilled, GithubFilled} from '@ant-design/icons';

const {Header, Content, Footer} = Layout;

const AdminLayout = ({children}: {children: JSX.Element}) => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(location.pathname.replace('/', ''));

  const logout = useAuthStore(state => state.logout);

  const onClick: MenuProps['onClick'] = ({key}) => {
    setCurrentPage(key);
  };

  const onLogoutClick = async () => {
    await logout();
  };

  return (
    <Layout>
      {/*<Header>*/}
        <div className="logo" />
        <Menu theme="light" mode="horizontal" selectedKeys={[currentPage]} onClick={onClick}>
          <Menu.Item key="schedule">
            <Link to="/schedule">Schedule</Link>
          </Menu.Item>
          <Menu.Item key="trip">
            <Link to="/trip">Trip</Link>
          </Menu.Item>
          <Menu.Item key="bus">
            <Link to="/bus">Bus</Link>
          </Menu.Item>
          <Menu.Item key="city">
            <Link to="/city">City</Link>
          </Menu.Item>
          <Menu.Item key="logout" style={{marginLeft: 'auto'}} onClick={() => onLogoutClick()}>
            Logout
          </Menu.Item>
        </Menu>
      {/*</Header>*/}
      <Content style={{padding: '0 50px'}}>
        <div className="site-layout-content">{children}</div>
      </Content>
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
          Copyright © 2023 by Expressway Commute Portal. All Rights Received{' '}
        </Typography.Text>
      </Footer>
    </Layout>
  );
};

export default AdminLayout;
