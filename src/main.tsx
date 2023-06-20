import {ConfigProvider} from 'antd';
import ReactDOM from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import RootRoute from './routes';

registerSW({immediate: true});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <ConfigProvider
      theme={{
        token: {
          colorText: '#444444',
          colorPrimary: '#1e88e5',
        },
      }}>
      <RootRoute />
    </ConfigProvider>
  </>,
);
