import {collection, getDocs, limit, query, where} from 'firebase/firestore';
import {db} from '../config/firebase';
import {FirestoreCollections} from '../models';
import {User} from '../models/User';

export const findByUID = async (uid: string) => {
  const snap = await getDocs(
    query(collection(db, FirestoreCollections.User), where('uid', '==', uid), limit(1)),
  );

  if (snap.empty || !snap.docs.length) {
    return;
  }

  return {...snap.docs[0].data(), id: snap.docs[0].id} as User;
};
