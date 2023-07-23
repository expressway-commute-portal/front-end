import {
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {FirestoreCollections} from '../models';
import {
  CreateFirebaseRotationSchedule,
  RotationSchedule,
  RotationScheduleWithRelations,
  rotationScheduleConverter,
} from '../models/RotationSchedule';
import {db} from '../config/firebase';
import {Trip} from '../models/Trip';
import * as tripService from './trip.service';
import {ScheduleType} from '../models/Schedule';

const rotationScheduleCollection = collection(
  db,
  FirestoreCollections.RotationSchedule,
).withConverter(rotationScheduleConverter);

export const findAllByTripId = async (tripIds: string[]) => {
  const snap = await getDocs(
    query(rotationScheduleCollection, where('tripId', 'in', tripIds), where('enabled', '==', true)),
  );
  const rotationSchedules = snap.docs.map(doc => ({
    ...doc.data(),
  })) as RotationSchedule[];

  return rotationSchedules;
};

export const getAllWithRelations = async () => {
  const snap = await getDocs(query(rotationScheduleCollection));

  const tripCache = new Map<string, Trip>();
  const schedules: RotationScheduleWithRelations[] = await Promise.all(
    snap.docs.map(doc => fetchRelations(doc, tripCache)),
  );

  schedules.sort((a, b) => a.tripId.localeCompare(b.tripId));

  return schedules;
};

export const getByIdWithRelations = async (id: string) => {
  const snapshot = await getDoc(
    doc(db, FirestoreCollections.RotationSchedule, id).withConverter(rotationScheduleConverter),
  );
  if (snapshot.exists()) {
    const schedule: RotationScheduleWithRelations = snapshot.data();

    const trip = await tripService.getById(schedule.tripId);
    trip && (schedule.trip = trip);
    return schedule;
  }
};

export const create = async (schedule: CreateFirebaseRotationSchedule) => {
  const document = {
    ...schedule,
    enabled: true,
    type: ScheduleType.ROTATION,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const reference = await addDoc(collection(db, FirestoreCollections.RotationSchedule), document);
  return reference.id;
};

export const update = async (id: string, schedule: Partial<RotationSchedule>) => {
  const document: Partial<RotationSchedule> = {
    ...schedule,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(doc(db, FirestoreCollections.RotationSchedule, id), document);
};

export async function deleteById(id: string) {
  await deleteDoc(doc(db, FirestoreCollections.RotationSchedule, id));
}

async function fetchRelations(
  doc: QueryDocumentSnapshot<RotationSchedule>,
  tripCache: Map<string, Trip>,
) {
  const schedule: RotationScheduleWithRelations = doc.data();

  if (!tripCache.has(schedule.tripId)) {
    const trip = await tripService.getById(schedule.tripId);
    if (trip) {
      tripCache.set(schedule.tripId, trip);
      schedule.trip = trip;
    }
  } else {
    schedule.trip = tripCache.get(schedule.tripId);
  }

  return schedule;
}
