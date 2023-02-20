import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {db} from '../config/firebase';
import {City, FirebaseCity} from '../models/City';
import {FirestoreCollections} from '../models';

export const getAllByName = async (name: string) => {
  name = name.charAt(0).toUpperCase() + name.slice(1);
  // some kind of hack to search for cities starting with a given name - https://stackoverflow.com/a/57290806/12158534
  const end = name.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
  const snap = await getDocs(
    query(
      collection(db, FirestoreCollections.City),
      where('name', '>=', name),
      where('name', '<', end),
    ),
  );
  const cities: City[] = snap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as FirebaseCity),
  }));

  return cities;
};

export const getAll = async () => {
  const snap = await getDocs(query(collection(db, FirestoreCollections.City)));
  const cities: City[] = snap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as FirebaseCity),
  }));
  return cities;
};

export const getById = async (id: string) => {
  const snapshot = await getDoc(doc(db, FirestoreCollections.City, id));
  if (snapshot.exists()) {
    return {id: snapshot.id, ...snapshot.data()} as City;
  }
};

export const create = async (bus: FirebaseCity) => {
  const document = {
    ...bus,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await addDoc(collection(db, FirestoreCollections.City), document as any);
};

export const update = async (id: string, bus: Partial<City>) => {
  const document: Partial<City> = {
    ...bus,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(doc(db, FirestoreCollections.City, id), document as any);
};

export const deleteById = async (id: string) => {
  await deleteDoc(doc(db, FirestoreCollections.City, id));
};
