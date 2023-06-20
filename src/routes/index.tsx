import 'antd/dist/reset.css';

import {Result, Spin, message} from 'antd';
import {getAnalytics, logEvent} from 'firebase/analytics';
import {onAuthStateChanged} from 'firebase/auth';
import {enableIndexedDbPersistence} from 'firebase/firestore';
import {useEffect, useState} from 'react';
import {Navigate, RouterProvider, createBrowserRouter, useLocation} from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import UserLayout from '../components/UserLayout/UserLayout';
import {auth, db} from '../config/firebase';
import {useAuthStore} from '../store/auth.store';
import {useUserStore} from '../store/user.store';
import BusRoute from './bus.route';
import CityRoute from './city.route';
import ScheduleRoute from './schedule.route';
import ScheduleSearchRoute from './scheduleSearch.route';
import SocialLoginRoute from './socialLogin.route';
import TripRoute from './trip.route';

const adminRoutes = ['/schedule', '/bus', '/city', '/trip'];

const analytics = getAnalytics();

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthenticationRoute>
        <UserLayout>
          <ScheduleSearchRoute />
        </UserLayout>
      </AuthenticationRoute>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/login',
    element: <SocialLoginRoute />,
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/schedule',
    element: (
      <AuthenticationRoute>
        <AdminLayout>
          <ScheduleRoute />
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
          <BusRoute />
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
          <CityRoute />
        </AdminLayout>
      </AuthenticationRoute>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/trip',
    element: (
      <AuthenticationRoute>
        <AdminLayout>
          <TripRoute />
        </AdminLayout>
      </AuthenticationRoute>
    ),
    errorElement: <h1>404 Error Page</h1>,
  },
]);

const RootRoute = () => {
  return <RouterProvider router={router} />;
};

function AuthenticationRoute({children}: {children: JSX.Element}) {
  const firebaseUserDetails = useAuthStore(state => state.firebaseUserDetails);

  const getLoggedInUser = useUserStore(state => state.getLoggedInUser);
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
    const run = async () => {
      if (firebaseUserDetails) {
        try {
          await getLoggedInUser(firebaseUserDetails.uid);
        } catch (e) {
          messageApi.error(e.message || 'Something went wrong');
        } finally {
          setLoading(false);
        }
      }
    };

    run().then();
  }, [firebaseUserDetails]);

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

  if (loggedInUser && loggedInUser.role !== 'ADMIN') {
    return <Result title="Site is under maintenance. Please bear with us for a while." />;
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
