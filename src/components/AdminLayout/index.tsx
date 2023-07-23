import {Layout, Menu, MenuProps} from 'antd';
import {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useAuthStore} from '../../store/auth.store';
import Footer from '../Footer';
import './index.css';

const {Content} = Layout;

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
          <Link to="/schedule">Permanent Schedules</Link>
        </Menu.Item>
        <Menu.Item key="rotationSchedule">
          <Link to="/rotation-schedule">Rotation Schedules</Link>
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
      <Footer />
    </Layout>
  );
};

export default AdminLayout;
