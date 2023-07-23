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
import {FirestoreCollections} from '../models';
import {FirebaseRoute, Route} from '../models/Route';

export async function getAll() {
  const snap = await getDocs(query(collection(db, FirestoreCollections.Route)));
  const routes = snap.docs.map(doc => ({...doc.data(), id: doc.id})) as Route[];
  routes.sort((a, b) => a.departureCity.name.localeCompare(b.departureCity.name));
  return routes;
}

export async function getById(id: string) {
  const snapshot = await getDoc(doc(db, FirestoreCollections.Route, id));
  if (snapshot.exists()) {
    return {...snapshot.data(), id: snapshot.id} as Route;
  }
}

export async function create(route: FirebaseRoute) {
  const document = {
    ...route,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await addDoc(collection(db, FirestoreCollections.Route), document as any);
}

export async function update(id: string, route: Partial<Route>) {
  const document: Partial<Route> = {
    ...route,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(doc(db, FirestoreCollections.Route, id), document as any);
}

export async function deleteById(id: string) {
  await deleteDoc(doc(db, FirestoreCollections.Route, id));
}

export const getRoutesByCityIds = async (departureCityId: string, arrivalCityId: string) => {
  let snap = await getDocs(
    query(
      collection(db, FirestoreCollections.Route),
      where('departureCity.id', '==', departureCityId),
      where('arrivalCity.id', '==', arrivalCityId),
    ),
  );

  if (!snap.empty || snap.docs.length) {
    return snap.docs.map(doc => ({...doc.data(), id: doc.id})) as Route[];
  }

  snap = await getDocs(
    query(
      collection(db, FirestoreCollections.Route),
      where('departureCity.id', '==', departureCityId),
      where('transitCityIds', 'array-contains', arrivalCityId),
    ),
  );

  if (!snap.empty || snap.docs.length) {
    return snap.docs.map(doc => ({...doc.data(), id: doc.id})) as Route[];
  }

  snap = await getDocs(
    query(
      collection(db, FirestoreCollections.Route),
      where('arrivalCity.id', '==', arrivalCityId),
      where('transitCityIds', 'array-contains', departureCityId),
    ),
  );

  if (!snap.empty || snap.docs.length) {
    return snap.docs.map(doc => ({...doc.data(), id: doc.id})) as Route[];
  }

  snap = await getDocs(
    query(
      collection(db, FirestoreCollections.Route),
      where('transitCityIds', 'array-contains-any', [arrivalCityId, departureCityId]),
    ),
  );

  if (!snap.empty || snap.docs.length) {
    return snap.docs
      .filter(doc => {
        const route = doc.data() as FirebaseRoute;
        const departureIndex = route.transitCityIds.findIndex(id => id === departureCityId);
        const arrivalIndex = route.transitCityIds.findIndex(id => id === arrivalCityId);

        return departureIndex > -1 && arrivalIndex > -1 && departureIndex < arrivalIndex;
      })
      .map(doc => ({...doc.data(), id: doc.id} as Route));
  }
  return [];
};
