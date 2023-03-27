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
  orderBy,
} from 'firebase/firestore';
import {db} from '../config/firebase';
import {City, cityConverter, FirebaseCity} from '../models/City';
import {FirestoreCollections} from '../models';

const cityCollection = collection(db, FirestoreCollections.City).withConverter(cityConverter);

export const getAllByName = async (name: string) => {
  name = name.charAt(0).toUpperCase() + name.slice(1);
  // some kind of hack to search for cities starting with a given name - https://stackoverflow.com/a/57290806/12158534
  const end = name.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));

  const snap = await getDocs(
    query(cityCollection, where('name', '>=', name), where('name', '<', end)),
  );
  return snap.docs.map(doc => ({
    ...doc.data(),
  })) as City[];
};

export const getAll = async () => {
  const snap = await getDocs(query(cityCollection, orderBy('name')));
  return snap.docs.map(doc => ({
    ...doc.data(),
  })) as City[];
};

export const getById = async (id: string) => {
  const snapshot = await getDoc(
    doc(db, FirestoreCollections.City, id).withConverter(cityConverter),
  );
  if (snapshot.exists()) {
    return snapshot.data();
  }
};

export const create = async (firebaseCity: FirebaseCity) => {
  const document = {
    ...firebaseCity,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await addDoc(collection(db, FirestoreCollections.City).withConverter(cityConverter), document);
};

export const update = async (id: string, city: Partial<City>) => {
  const document: Partial<City> = {
    ...city,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(doc(db, FirestoreCollections.City, id), document as any);
};

export const deleteById = async (id: string) => {
  await deleteDoc(doc(db, FirestoreCollections.City, id));
};
