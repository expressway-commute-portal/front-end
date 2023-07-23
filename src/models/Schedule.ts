import {DocumentData, FirestoreDataConverter, Timestamp, WithFieldValue} from 'firebase/firestore';
import {Bus} from './Bus';
import {Route} from './Route';

export enum ScheduleType {
  PERMANENT = 'PERMANENT',
  ROTATION = 'ROTATION',
}

interface BaseSchedule {
  routeId: string;
  busId?: string;
  type: ScheduleType;

  enabled: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Schedule extends BaseSchedule {
  id: string;
  departureTime: Date;
  arrivalTime?: Date;

  transitTimes: {
    cityId: string;
    time: Date;
  }[];
}

export interface FirebaseSchedule extends BaseSchedule {
  departureTime: Timestamp;
  arrivalTime?: Timestamp;
  transitTimes: {
    cityId: string;
    time: Timestamp;
  }[];
}

export type ScheduleWithRelations = Schedule & {route?: Route; bus?: Bus};

export type CreateFirebaseSchedule = Partial<Schedule> & {arrivalTime?: Date; departureTime?: Date};

export const scheduleConverter: FirestoreDataConverter<Schedule> = {
  toFirestore: (obj: WithFieldValue<Schedule>): DocumentData => {
    return obj;
  },
  fromFirestore: (snapshot, options?): Schedule => {
    const documentData = snapshot.data(options) as FirebaseSchedule;
    return {
      ...documentData,
      id: snapshot.id,
      departureTime: documentData.departureTime.toDate(),
      arrivalTime: documentData.arrivalTime ? documentData.arrivalTime.toDate() : undefined,
      transitTimes: (documentData.transitTimes || []).map(transitTime => ({
        ...transitTime,
        time: transitTime.time.toDate(),
      })),
    };
  },
};
