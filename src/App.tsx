import React, {useEffect, useState} from 'react';
import {Button, Spin} from 'antd';
import {
  collection,
  query,
  getDocs,
  enableIndexedDbPersistence,
  getFirestore,
} from 'firebase/firestore';
import {getAuth, signInAnonymously} from 'firebase/auth';
import './App.css';
import {app} from './config/firebase';

type City = {id: string; name: string; fromCache: boolean};
const db = getFirestore(app);

function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'city')));
    const map = snap.docs.map(doc => {
      return {...doc.data(), id: doc.id, fromCache: doc.metadata.fromCache};
    });
    setCities(map as any);
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      await enableIndexedDbPersistence(db);
      console.log('offline persistence enabled');

      const auth = getAuth();
      await signInAnonymously(auth).catch(e => {
        console.log('sign in failed', e.message);
      });
    };

    run()
      .then()
      .catch(e => console.log(e));
  }, []);

  return (
    <div>
      {loading && <Spin />}
      {cities.map(city => {
        return (
          <div key={city.id}>
            {city.name} - {city.fromCache ? 'from cache' : 'from server'}
          </div>
        );
      })}
      <br />
      <br />
      <br />
      <br />
      <Button type={'primary'} onClick={() => fetchData()} loading={loading}>
        Fetch data
      </Button>
    </div>
  );
}

export default App;
