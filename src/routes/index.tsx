import 'antd/dist/reset.css';

import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import React, {useEffect} from 'react';
import {db} from '../config/firebase';
import App from './App';
import BusRoute from './bus.route';
import {enableIndexedDbPersistence} from 'firebase/firestore';
import {getAuth, signInAnonymously} from 'firebase/auth';
import CityRoute from './city.route';
import TripRoute from './trip.route';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BusRoute />,
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/schedule',
    element: <App />,
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/bus',
    element: <BusRoute />,
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/city',
    element: <CityRoute />,
    errorElement: <h1>404 Error Page</h1>,
  },
  {
    path: '/trip',
    element: <TripRoute />,
    errorElement: <h1>404 Error Page</h1>,
  },
]);

const Routes = () => {
  const onInit = async () => {
    console.log('onInit');
    /*await enableIndexedDbPersistence(db).catch(e => {
      console.log('DB Persistence Error', e.message);
    });*/

    await signInAnonymously(getAuth()).catch(e => {
      console.log('Sign In Error', e.message);
    });
  };

  useEffect(() => {
    onInit().then().catch();
  }, []);

  return <RouterProvider router={router} />;
};

export default Routes;
