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
import { FirestoreCollections } from "../models";
import {
  CreateFirebaseRotationSchedule,
  RotationSchedule,
  rotationScheduleConverter,
  RotationScheduleWithRelations
} from "../models/RotationSchedule";
import { db } from "../config/firebase";
import { Route } from "../models/Route";
import * as routeService from "./route.service";
import { ScheduleType } from "../models/Schedule";

const rotationScheduleCollection = collection(
  db,
  FirestoreCollections.RotationSchedule
).withConverter(rotationScheduleConverter);

export const findAllByRouteIds = async (routeIds: string[]) => {
  const snap = await getDocs(
    query(rotationScheduleCollection, where("routeId", "in", routeIds), where("enabled", "==", true))
  );
  return snap.docs.map(doc => ({
    ...doc.data()
  })) as RotationSchedule[];
};

export const getAllWithRelations = async () => {
  const snap = await getDocs(query(rotationScheduleCollection));

  const routeCache = new Map<string, Route>();
  const schedules: RotationScheduleWithRelations[] = await Promise.all(
    snap.docs.map(doc => fetchRelations(doc, routeCache))
  );

  schedules.sort((a, b) => a.routeId.localeCompare(b.routeId));

  return schedules;
};

export const getByIdWithRelations = async (id: string) => {
  const snapshot = await getDoc(
    doc(db, FirestoreCollections.RotationSchedule, id).withConverter(rotationScheduleConverter)
  );
  if (snapshot.exists()) {
    const schedule: RotationScheduleWithRelations = snapshot.data();

    const route = await routeService.getById(schedule.routeId);
    route && (schedule.route = route);
    return schedule;
  }
};

export const create = async (schedule: CreateFirebaseRotationSchedule) => {
  const document = {
    ...schedule,
    enabled: true,
    type: ScheduleType.ROTATION,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const reference = await addDoc(collection(db, FirestoreCollections.RotationSchedule), document);
  return reference.id;
};

export const update = async (id: string, schedule: Partial<RotationSchedule>) => {
  const document: Partial<RotationSchedule> = {
    ...schedule,
    updatedAt: Timestamp.now()
  };

  await updateDoc(doc(db, FirestoreCollections.RotationSchedule, id), document);
};

export async function deleteById(id: string) {
  await deleteDoc(doc(db, FirestoreCollections.RotationSchedule, id));
}

async function fetchRelations(
  doc: QueryDocumentSnapshot<RotationSchedule>,
  routeCache: Map<string, Route>
) {
  const schedule: RotationScheduleWithRelations = doc.data();

  if (!routeCache.has(schedule.routeId)) {
    const route = await routeService.getById(schedule.routeId);
    if (route) {
      routeCache.set(schedule.routeId, route);
      schedule.route = route;
    }
  } else {
    schedule.route = routeCache.get(schedule.routeId);
  }

  return schedule;
}
