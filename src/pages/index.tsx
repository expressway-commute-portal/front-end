import 'antd/dist/reset.css';

import {Spin, message} from 'antd';
import {logEvent} from 'firebase/analytics';
import {onAuthStateChanged} from 'firebase/auth';
import {enableIndexedDbPersistence} from 'firebase/firestore';
import {useEffect, useState} from 'react';
import {Navigate, RouterProvider, createBrowserRouter, useLocation} from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import UserLayout from '../components/UserLayout/UserLayout';
import {analytics, auth, db} from '../config/firebase';
import {useAuthStore} from '../store/auth.store';
import {useUserStore} from '../store/user.store';
import BusPage from './bus.page';
import CityPage from './city.page';
import RotationScheduleRoute from './rotationSchedule';
import SchedulePage from './schedule.page';
import ScheduleSearchPage from './scheduleSearch.page';
import SocialLoginPage from './socialLogin.page';
import RoutePage from './route.page';

const adminRoutes = ['/schedule', '/bus', '/city', '/route'];

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthenticationRoute>
        <UserLayout>
          <ScheduleSearchPage />
        </UserLayout>
      </AuthenticationRoute>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/login',
    element: (
      <UserLayout>
        <SocialLoginPage />
      </UserLayout>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/schedule',
    element: (
      <AuthenticationRoute>
        <AdminLayout>
          <SchedulePage />
        </AdminLayout>
      </AuthenticationRoute>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/rotation-schedule',
    element: (
      <AuthenticationRoute>
        <AdminLayout>
          <RotationScheduleRoute />
        </AdminLayout>
      </AuthenticationRoute>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/bus',
    element: (
      <AuthenticationRoute>
        <AdminLayout>
          <BusPage />
        </AdminLayout>
      </AuthenticationRoute>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/city',
    element: (
      <AuthenticationRoute>
        <AdminLayout>
          <CityPage />
        </AdminLayout>
      </AuthenticationRoute>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/route',
    element: (
      <AuthenticationRoute>
        <AdminLayout>
          <RoutePage />
        </AdminLayout>
      </AuthenticationRoute>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const RootRoute = () => {
  return <RouterProvider router={router} />;
};

function AuthenticationRoute({children}: {children: JSX.Element}) {
  const firebaseUserDetails = useAuthStore(state => state.firebaseUserDetails);

  const findAndWatchUser = useUserStore(state => state.findAndWatchUser);
  const loggedInUser = useUserStore(state => state.loggedInUser);

  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      if (user) {
        useAuthStore.setState({firebaseUserDetails: user});
        logEvent(analytics, 'login', {uid: user.uid});
      } else {
        setLoading(false);
        messageApi.error('You are not authenticated. Please login again');
        useAuthStore.setState({firebaseUserDetails: undefined});
        useUserStore.setState({loggedInUser: undefined});
      }
    });
  }, []);

  useEffect(() => {
    if (import.meta.env.MODE === 'production') {
      try {
        enableIndexedDbPersistence(db)
          .then()
          .catch(e => {
            if (e.code === 'failed-precondition') {
              message.warning(
                'Multiple tabs open, Offline data access cannot be enabled. Please close all other tabs',
              );
            } else if (e.code === 'unimplemented') {
              message.warning(
                'This browser does not support offline data access. Please use Chrome, Safari or Firefox',
              );
            }
          });
      } catch (e) {
        console.log(e);
      }
    }
  }, []);

  useEffect(() => {
    if (firebaseUserDetails) {
      return findAndWatchUser(firebaseUserDetails.uid);
    }
  }, [firebaseUserDetails]);

  useEffect(() => {
    if (loggedInUser) {
      setLoading(false);
    }
  }, [loggedInUser]);

  if (loading) {
    return (
      <div style={{margin: '20px', textAlign: 'center'}}>
        <Spin size={'large'} tip={'Please wait'} />
      </div>
    );
  }

  if (!firebaseUserDetails) {
    return (
      <Navigate
        to="/login"
        state={{from: location, errorMessage: 'You are not authenticated. Please login again'}}
        replace
      />
    );
  }

  if (!loggedInUser) {
    return (
      <Navigate
        to="/login"
        state={{from: location, errorMessage: 'You are not authorized. Please contact admin'}}
        replace
      />
    );
  }

  if (loggedInUser && adminRoutes.includes(location.pathname) && loggedInUser.role !== 'ADMIN') {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
}

export default RootRoute;
