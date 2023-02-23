import React, {useState} from 'react';
import {Button, Layout, Menu, MenuProps} from 'antd';
import {Link, useLocation} from 'react-router-dom';
import './AdminLayout.css';
import {useAuthStore} from '../store/auth.store';

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
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" selectedKeys={[currentPage]} onClick={onClick}>
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
          <Menu.Item key="logout" style={{marginLeft: 'auto'}}>
            <Button onClick={() => onLogoutClick()}>Logout</Button>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{padding: '0 50px'}}>
        <div className="site-layout-content">{children}</div>
      </Content>
      <Footer style={{textAlign: 'center'}}>Ant Design ©2023 Created by Ant UED</Footer>
    </Layout>
  );
};

export default AdminLayout;
