import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Routes from './routes';
import {ConfigProvider} from 'antd';
import {registerSW} from 'virtual:pwa-register';

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
      <Routes />
    </ConfigProvider>
  </>,
);
