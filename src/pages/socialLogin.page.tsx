import {GoogleOutlined} from '@ant-design/icons';
import {Button, Card, Col, Row, Typography, message} from 'antd';
import {logEvent} from 'firebase/analytics';
import {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {analytics} from '../config/firebase';
import {useAuthStore} from '../store/auth.store';
import {FirebaseErrorMap} from '../util/firebaseErrors';

const SocialLoginPage = () => {
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
      <Col xs={24} sm={20} md={16} lg={12} xl={8} xxl={6} style={{marginTop: 20}}>
        {contextHolder}
        <Card
          cover={
            <div style={{textAlign: 'center'}}>
              <img src={'./assets/highway-sign.png'} width={300} height={300} />
            </div>
          }
          title={'Expressway Commute Portal'}
          headStyle={{textAlign: 'center', fontSize: 18}}
          bodyStyle={{textAlign: 'center'}}>
          <Button
            size={'large'}
            loading={googleSignInLoading}
            block
            htmlType="submit"
            icon={<GoogleOutlined />}
            onClick={onGoogleSignInClick}>
            Continue with Google
          </Button>
          <br />
          <br />
          <Typography.Text type="secondary">
            {' '}
            By Signing in, you agree to our{' '}
            <a
              href={'https://www.termsfeed.com/live/9a447956-ffe0-4cf2-9280-99535b6f6255'}
              target="_blank"
              rel="noreferrer">
              Terms and Conditions
            </a>
          </Typography.Text>
        </Card>
        <br />
        <br />
        <br />
      </Col>
    </Row>
  );
};

export default SocialLoginPage;
