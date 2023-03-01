import 'antd/dist/reset.css';

import {createBrowserRouter, Navigate, RouterProvider, useLocation} from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import BusRoute from './bus.route';
import {onAuthStateChanged} from 'firebase/auth';
import CityRoute from './city.route';
import TripRoute from './trip.route';
import ScheduleRoute from './schedule.route';
import {useAuthStore} from '../store/auth.store';
import AdminLayout from '../components/AdminLayout';
import {auth, db} from '../config/firebase';
import {message, Spin} from 'antd';
import SocialLoginRoute from './socialLogin.route';
import ScheduleSearchRoute from './scheduleSearch.route';
import {useUserStore} from '../store/user.store';
import {enableIndexedDbPersistence} from 'firebase/firestore';

const adminRoutes = ['/schedule', '/bus', '/city', '/trip'];

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthenticationRoute>
        <ScheduleSearchRoute />
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

const Routes = () => {
  return <RouterProvider router={router} />;
};

function AuthenticationRoute({children}: {children: JSX.Element}) {
  const firebaseUserDetails = useAuthStore(state => state.firebaseUserDetails);

  const getLoggedInUser = useUserStore(state => state.getLoggedInUser);
  const loggedInUser = useUserStore(state => state.loggedInUser);

  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      setLoading(false);

      if (user) {
        useAuthStore.setState({firebaseUserDetails: user});
      } else {
        useAuthStore.setState({firebaseUserDetails: undefined});
        useUserStore.setState({loggedInUser: undefined});
      }
    });
  }, []);

  useEffect(() => {
    if (import.meta.env.MODE === 'production') {
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
    }
  }, []);

  useEffect(() => {
    if (firebaseUserDetails) {
      getLoggedInUser(firebaseUserDetails.uid).then().catch();
    }
  }, [firebaseUserDetails]);

  if (loading) {
    return (
      <div style={{margin: '20px', textAlign: 'center'}}>
        <Spin size={'large'} tip={'Please wait'} />
      </div>
    );
  }

  if (!firebaseUserDetails) {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  if (loggedInUser && adminRoutes.includes(location.pathname) && loggedInUser.role !== 'ADMIN') {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  return children;
}

export default Routes;
