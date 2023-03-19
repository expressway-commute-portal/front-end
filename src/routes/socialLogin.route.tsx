import React from 'react';
import {Button, Card, Col, message, Row} from 'antd';
import {useAuthStore} from '../store/auth.store';
import {useLocation, useNavigate} from 'react-router-dom';
import {GoogleOutlined} from '@ant-design/icons';

const SocialLoginRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const googleSignInLoading = useAuthStore(state => state.googleSignInLoading);
  const googleSignIn = useAuthStore(state => state.googleSignIn);

  const [messageApi, contextHolder] = message.useMessage();

  const onGoogleSignInClick = async () => {
    try {
      await googleSignIn();
      const from = location.state?.from?.pathname || '/';
      navigate(from, {replace: true});
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  return (
    <Row justify={'center'}>
      <Col xs={24} sm={20} md={16} lg={12} xl={6} xxl={4} style={{marginTop: 20}}>
        {contextHolder}
        <Card cover={<img src={'/pwa-512x512.png'}/>}>
          <Button
            type={'default'}
            size={'large'}
            loading={googleSignInLoading}
            block
            htmlType='submit'
            icon={<GoogleOutlined />}
            onClick={onGoogleSignInClick}>
            Continue with Google
          </Button>
        </Card>
      </Col>
    </Row>
  );
};

export default SocialLoginRoute;
