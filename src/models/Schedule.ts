import {DocumentData, FirestoreDataConverter, Timestamp, WithFieldValue} from 'firebase/firestore';
import {Bus} from './Bus';
import {Trip} from './Trip';

interface BaseSchedule {
  tripId: string;
  busId?: string;

  enabled: boolean;

  transitTimes: {
    cityId: string;
    departureTime: Timestamp;
  }[];

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Schedule extends BaseSchedule {
  id: string;
  departureTime: Date;
  arrivalTime: Date;
}

export interface FirebaseSchedule extends BaseSchedule {
  departureTime: Timestamp;
  arrivalTime: Timestamp;
}

export type ScheduleWithRelations = Schedule & {trip?: Trip; bus?: Bus};

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
      arrivalTime: documentData.arrivalTime.toDate(),
    };
  },
};
