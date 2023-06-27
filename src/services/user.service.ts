import {collection, getDocs, limit, onSnapshot, query, where} from 'firebase/firestore';
import {db} from '../config/firebase';
import {FirestoreCollections} from '../models';
import {User} from '../models/User';
import {UserState} from '../store/user.store';

export const findByUID = async (uid: string) => {
  const snap = await getDocs(
    query(collection(db, FirestoreCollections.User), where('uid', '==', uid), limit(1)),
  );

  if (snap.empty || !snap.docs.length) {
    return;
  }

  return {...snap.docs[0].data(), id: snap.docs[0].id} as User;
};

export const findAndWatchByUID = (
  uid: string,
  setUser: (user: Pick<UserState, 'loggedInUser'>) => void,
) => {
  return onSnapshot(
    query(collection(db, FirestoreCollections.User), where('uid', '==', uid), limit(1)),
    snap => {
      if (snap.empty || !snap.docs.length) {
        return;
      }

      setUser({loggedInUser: {...snap.docs[0].data(), id: snap.docs[0].id} as User});
    },
  );
};
