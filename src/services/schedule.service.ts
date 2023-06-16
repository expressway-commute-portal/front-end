import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  QueryDocumentSnapshot,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {db} from '../config/firebase';
import {FirestoreCollections} from '../models';
import {
  CreateFirebaseSchedule,
  FirebaseSchedule,
  Schedule,
  scheduleConverter,
  ScheduleWithRelations,
} from '../models/Schedule';
import * as tripService from './trip.service';
import * as busService from './bus.service';
import {timeOnlyCompare} from '../util';
import dayjs from 'dayjs';
import {Trip} from '../models/Trip';
import {Bus} from '../models/Bus';

const scheduleCollection = collection(db, FirestoreCollections.Schedule).withConverter(
  scheduleConverter,
);

export async function getSchedulesByTripId(tripId: string) {
  const snap = await getDocs(
    query(scheduleCollection, where('tripId', '==', tripId), where('enabled', '==', true)),
  );
  const schedules = snap.docs.map(doc => ({
    ...doc.data(),
  })) as Schedule[];
  schedules.sort((a, b) => timeOnlyCompare(dayjs(a.departureTime), dayjs(b.departureTime)));
  return schedules;
}

export const getAllWithRelations = async () => {
  const snap = await getDocs(query(scheduleCollection));

  const tripCache = new Map<string, Trip>();
  const busCache = new Map<string, Bus>();
  const schedules: ScheduleWithRelations[] = await Promise.all(
    snap.docs.map(doc => fetchRelations(doc, tripCache, busCache)),
  );

  schedules.sort((a, b) => {
    return (
      a.tripId.localeCompare(b.tripId) ||
      timeOnlyCompare(dayjs(a.departureTime), dayjs(b.departureTime))
    );
  });
  return schedules;
};

export const getByIdWithRelations = async (id: string) => {
  const snapshot = await getDoc(
    doc(db, FirestoreCollections.Schedule, id).withConverter(scheduleConverter),
  );
  if (snapshot.exists()) {
    const schedule: ScheduleWithRelations = snapshot.data();

    const trip = await tripService.getById(schedule.tripId);
    trip && (schedule.trip = trip);

    if (schedule.busId) {
      const bus = await busService.getById(schedule.busId);
      bus && (schedule.bus = bus);
    }
    return schedule;
  }
};

export const create = async (schedule: CreateFirebaseSchedule) => {
  const document = {
    ...schedule,
    enabled: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const reference = await addDoc(collection(db, FirestoreCollections.Schedule), document);
  return reference.id;
};

export const update = async (id: string, schedule: Partial<Schedule>) => {
  const document: Partial<Schedule> = {
    ...schedule,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(doc(db, FirestoreCollections.Schedule, id), document);
};

export async function deleteById(id: string) {
  await deleteDoc(doc(db, FirestoreCollections.Schedule, id));
}

async function fetchRelations(
  doc: QueryDocumentSnapshot<Schedule>,
  tripCache: Map<string, Trip>,
  busCache: Map<string, Bus>,
) {
  const schedule: ScheduleWithRelations = doc.data();

  if (!tripCache.has(schedule.tripId)) {
    const trip = await tripService.getById(schedule.tripId);
    if (trip) {
      tripCache.set(schedule.tripId, trip);
      schedule.trip = trip;
    }
  } else {
    schedule.trip = tripCache.get(schedule.tripId);
  }

  if (schedule.busId) {
    if (!busCache.has(schedule.busId)) {
      const bus = await busService.getById(schedule.busId);
      if (bus) {
        busCache.set(schedule.busId, bus);
        schedule.bus = bus;
      }
    } else {
      schedule.bus = busCache.get(schedule.busId);
    }
  }
  return schedule;
}
