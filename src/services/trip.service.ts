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
import {FirebaseTrip, Trip} from '../models/Trip';

export async function getAll() {
  const snap = await getDocs(query(collection(db, FirestoreCollections.Trip)));
  const trips = snap.docs.map(doc => ({...doc.data(), id: doc.id})) as Trip[];
  trips.sort((a, b) => a.departureCity.name.localeCompare(b.departureCity.name));
  return trips;
}

export async function getById(id: string) {
  const snapshot = await getDoc(doc(db, FirestoreCollections.Trip, id));
  if (snapshot.exists()) {
    return {...snapshot.data(), id: snapshot.id} as Trip;
  }
}

export async function create(trip: FirebaseTrip) {
  const document = {
    ...trip,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await addDoc(collection(db, FirestoreCollections.Trip), document as any);
}

export async function update(id: string, trip: Partial<Trip>) {
  const document: Partial<Trip> = {
    ...trip,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(doc(db, FirestoreCollections.Trip, id), document as any);
}

export async function deleteById(id: string) {
  await deleteDoc(doc(db, FirestoreCollections.Trip, id));
}

export const getTripsByCityIds = async (departureCityId: string, arrivalCityId: string) => {
  let snap = await getDocs(
    query(
      collection(db, FirestoreCollections.Trip),
      where('departureCity.id', '==', departureCityId),
      where('arrivalCity.id', '==', arrivalCityId),
    ),
  );

  if (!snap.empty || snap.docs.length) {
    return snap.docs.map(doc => ({...doc.data(), id: doc.id})) as Trip[];
  }

  snap = await getDocs(
    query(
      collection(db, FirestoreCollections.Trip),
      where('departureCity.id', '==', departureCityId),
      where('transitCityIds', 'array-contains', arrivalCityId),
    ),
  );

  if (!snap.empty || snap.docs.length) {
    return snap.docs.map(doc => ({...doc.data(), id: doc.id})) as Trip[];
  }

  snap = await getDocs(
    query(
      collection(db, FirestoreCollections.Trip),
      where('arrivalCity.id', '==', arrivalCityId),
      where('transitCityIds', 'array-contains', departureCityId),
    ),
  );

  if (!snap.empty || snap.docs.length) {
    return snap.docs.map(doc => ({...doc.data(), id: doc.id})) as Trip[];
  }

  snap = await getDocs(
    query(
      collection(db, FirestoreCollections.Trip),
      where('transitCityIds', 'array-contains-any', [arrivalCityId, departureCityId]),
    ),
  );

  if (!snap.empty || snap.docs.length) {
    return snap.docs
      .filter(doc => {
        const trip = doc.data() as FirebaseTrip;
        const departureIndex = trip.transitCityIds.findIndex(id => id === departureCityId);
        const arrivalIndex = trip.transitCityIds.findIndex(id => id === arrivalCityId);

        return departureIndex > -1 && arrivalIndex > -1 && departureIndex < arrivalIndex;
      })
      .map(doc => ({...doc.data(), id: doc.id} as Trip));
  }
  return [];
};
