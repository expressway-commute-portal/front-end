import {
  collection,
  getDocs,
  limit,
  query,
  where,
  orderBy,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {db} from '../config/firebase';
import {FirestoreCollections} from '../models';
import {FirebaseSchedule, Schedule, ScheduleWithRelations} from '../models/Schedule';
import * as tripService from './trip.service';
import * as busService from './bus.service';
import {timeOnlyCompare} from '../util';
import dayjs from 'dayjs';

export async function getSchedulesByTripId(tripId: string) {
  const snap = await getDocs(
    query(collection(db, FirestoreCollections.Schedule), where('tripId', '==', tripId)),
  );
  const schedules: Schedule[] = snap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as FirebaseSchedule),
  }));
  return schedules;
}

export const getAllWithRelations = async () => {
  const snap = await getDocs(query(collection(db, FirestoreCollections.Schedule)));
  const schedules: ScheduleWithRelations[] = await Promise.all(
    snap.docs.map(async doc => {
      const schedule: ScheduleWithRelations = {id: doc.id, ...doc.data()} as Schedule;

      const trip = await tripService.getById(schedule.tripId);
      trip && (schedule.trip = trip);

      if (schedule.busId) {
        const bus = await busService.getById(schedule.busId);
        bus && (schedule.bus = bus);
      }
      return schedule;
    }),
  );

  schedules.sort((a, b) => {
    return (
      a.tripId.localeCompare(b.tripId) ||
      timeOnlyCompare(dayjs(a.departureTime.toDate()), dayjs(b.departureTime.toDate()))
    );
  });
  return schedules;
};

export const create = async (schedule: FirebaseSchedule) => {
  const document = {
    ...schedule,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await addDoc(collection(db, FirestoreCollections.Schedule), document);
};

export const update = async (id: string, schedule: Partial<Schedule>) => {
  const document: Partial<Schedule> = {
    ...schedule,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(doc(db, FirestoreCollections.Schedule, id), document);
};
