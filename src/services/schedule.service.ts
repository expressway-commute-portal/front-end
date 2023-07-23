import dayjs from "dayjs";
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
  where
} from "firebase/firestore";
import { db } from "../config/firebase";
import { FirestoreCollections } from "../models";
import { Bus } from "../models/Bus";
import {
  CreateFirebaseSchedule,
  Schedule,
  scheduleConverter,
  ScheduleWithRelations
} from "../models/Schedule";
import { Route } from "../models/Route";
import { timeOnlyCompare } from "../util";
import * as busService from "./bus.service";
import * as routeService from "./route.service";

const scheduleCollection = collection(db, FirestoreCollections.Schedule).withConverter(
  scheduleConverter
);

export async function getSchedulesByRouteIds(routeIds: string[]) {
  const snap = await getDocs(
    query(scheduleCollection, where("routeId", "in", routeIds), where("enabled", "==", true))
  );
  const schedules = snap.docs.map(doc => ({
    ...doc.data()
  })) as Schedule[];
  schedules.sort((a, b) => timeOnlyCompare(dayjs(a.departureTime), dayjs(b.departureTime)));
  return schedules;
}

export const getAllWithRelations = async () => {
  const snap = await getDocs(query(scheduleCollection));

  const routeCache = new Map<string, Route>();
  const busCache = new Map<string, Bus>();
  const schedules: ScheduleWithRelations[] = await Promise.all(
    snap.docs.map(doc => fetchRelations(doc, routeCache, busCache))
  );

  schedules.sort((a, b) => {
    return (
      a.routeId.localeCompare(b.routeId) ||
      timeOnlyCompare(dayjs(a.departureTime), dayjs(b.departureTime))
    );
  });
  return schedules;
};

export const getByIdWithRelations = async (id: string) => {
  const snapshot = await getDoc(
    doc(db, FirestoreCollections.Schedule, id).withConverter(scheduleConverter)
  );
  if (snapshot.exists()) {
    const schedule: ScheduleWithRelations = snapshot.data();

    const route = await routeService.getById(schedule.routeId);
    route && (schedule.route = route);

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
    updatedAt: Timestamp.now()
  };

  const reference = await addDoc(collection(db, FirestoreCollections.Schedule), document);
  return reference.id;
};

export const update = async (id: string, schedule: Partial<Schedule>) => {
  const document: Partial<Schedule> = {
    ...schedule,
    updatedAt: Timestamp.now()
  };

  await updateDoc(doc(db, FirestoreCollections.Schedule, id), document);
};

export async function deleteById(id: string) {
  await deleteDoc(doc(db, FirestoreCollections.Schedule, id));
}

async function fetchRelations(
  doc: QueryDocumentSnapshot<Schedule>,
  routeCache: Map<string, Route>,
  busCache: Map<string, Bus>
) {
  const schedule: ScheduleWithRelations = doc.data();

  if (!routeCache.has(schedule.routeId)) {
    const route = await routeService.getById(schedule.routeId);
    if (route) {
      routeCache.set(schedule.routeId, route);
      schedule.route = route;
    }
  } else {
    schedule.route = routeCache.get(schedule.routeId);
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
