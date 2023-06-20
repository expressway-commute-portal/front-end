import {GoogleOutlined} from '@ant-design/icons';
import {Button, Card, Col, Row, message} from 'antd';
import {getAnalytics, logEvent} from 'firebase/analytics';
import {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuthStore} from '../store/auth.store';
import {FirebaseErrorMap} from '../util/firebaseErrors';

const analytics = getAnalytics();

const SocialLoginRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const googleSignInLoading = useAuthStore(state => state.googleSignInLoading);
  const googleSignIn = useAuthStore(state => state.googleSignIn);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (location.state.errorMessage) {
      messageApi.error(location.state.errorMessage);
    }
  }, [location.state.errorMessage]);

  const onGoogleSignInClick = async () => {
    try {
      const user = await googleSignIn();
      logEvent(analytics, 'sign_up', {method: 'google', user_id: user.uid});
      const from = location.state?.from?.pathname || '/';
      navigate(from, {replace: true});
    } catch (e) {
      messageApi.error(FirebaseErrorMap[e.code]);
    }
  };

  return (
    <Row justify={'center'}>
      <Col xs={24} sm={20} md={16} lg={12} xl={6} xxl={4} style={{marginTop: 20}}>
        {contextHolder}
        <Card cover={<img src={'/pwa-512x512.png'} />}>
          <Button
            type={'default'}
            size={'large'}
            loading={googleSignInLoading}
            block
            htmlType="submit"
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
