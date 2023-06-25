import {Layout} from 'antd';
import Footer from '../Footer';

const {Content} = Layout;

const UserLayout = ({children}: {children: JSX.Element}) => {
  return (
    <Layout>
      <Content>{children}</Content>
      <Footer />
    </Layout>
  );
};

export default UserLayout;
