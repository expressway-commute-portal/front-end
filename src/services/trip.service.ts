import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {FirebaseTrip, Trip} from '../models/Trip';
import {db} from '../config/firebase';
import {FirestoreCollections} from '../models';

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

export const getTripByCityIds = async (departureCityId: string, arrivalCityId: string) => {
  const snap = await getDocs(
    query(
      collection(db, FirestoreCollections.Trip),
      where('departureCity.id', '==', departureCityId),
      where('arrivalCity.id', '==', arrivalCityId),
      limit(1),
    ),
  );

  if (snap.empty || !snap.docs.length) {
    return;
  }

  return {...snap.docs[0].data(), id: snap.docs[0].id} as Trip;
};
